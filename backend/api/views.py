from collections import defaultdict
import csv
import io
import json
import logging
import os
import re

from django.contrib.auth import authenticate
from django.http import HttpResponse
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from groq import Groq

try:
    import pdfplumber  # type: ignore
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

try:
    from docx import Document  # type: ignore
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

from .crossword_layout import (
    compute_difficulty_from_metrics,
    compute_layout_metrics,
    generate_crossword_layout,
    build_letter_grid_from_placements,
)
from .models import Attempt, Clue, Puzzle, Student, Teacher
from .serializers import AttemptSerializer, PuzzleSerializer

logger = logging.getLogger(__name__)

MIN_ANSWER_LENGTH = 3
MAX_ANSWER_LENGTH = 25
MAX_UPLOAD_BYTES = 5 * 1024 * 1024




def _extract_text_from_upload(upload):
    if not upload:
        raise ValueError("File is required")
    if upload.size and upload.size > MAX_UPLOAD_BYTES:
        raise ValueError("File too large. Maximum size is 5MB.")

    filename = (upload.name or "").lower()
    if filename.endswith(".pdf"):
        if not PDFPLUMBER_AVAILABLE:
            raise ImportError("pdfplumber is not installed")
        text_chunks = []
        with pdfplumber.open(upload) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_chunks.append(page_text)
        return "\n".join(text_chunks).strip()
    if filename.endswith(".docx") or filename.endswith(".doc"):
        if not DOCX_AVAILABLE:
            raise ImportError("python-docx is not installed")
        doc = Document(upload)
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()]).strip()

    raise ValueError("Unsupported file type. Upload PDF or DOCX only.")


def generate_clues_with_groq(text, difficulty, num_questions, topic_hint=None):
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    topic_line = f"Focus on this topic if present: {topic_hint}" if topic_hint else ""
    requested_total = num_questions + 5

    prompt = f"""
You are a crossword puzzle generator.
Given the following text, generate {requested_total} crossword clue-answer pairs.
Difficulty: {difficulty}
{topic_line}

Rules:
- Each answer must be a single word (no spaces)
- Minimum answer length: 3 characters
- Answers must be real words from the text
- Clues must match the difficulty:
  Easy: fill-in-the-blank or direct definition
  Medium: indirect or contextual clue
  Hard: cryptic or inferential clue
- Return ONLY a valid JSON array, no explanation, no markdown, no code blocks
- Format exactly:
[
  {{"word": "ANSWER", "clue": "Clue text here"}},
  ...
]

Text:
{text[:4000]}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000,
        )
        raw = response.choices[0].message.content.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        return json.loads(raw)

    except json.JSONDecodeError:
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "user", "content": prompt},
                    {"role": "assistant", "content": "Here is the JSON array:"},
                ],
                temperature=0.3,
                max_tokens=1000,
            )
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            return json.loads(raw.strip())
        except Exception as exc:
            raise Exception(f"AI generation failed: {str(exc)}")


def _normalize_answer(raw_answer):
    answer = str(raw_answer or "").strip().upper()
    if not answer:
        raise ValueError("Answer is required")
    if any(not ch.isalpha() for ch in answer):
        raise ValueError(
            f"Invalid characters in answer '{answer}'. Use letters A-Z only."
        )
    if len(answer) < MIN_ANSWER_LENGTH:
        raise ValueError(
            f"Answer '{answer}' is too short (minimum {MIN_ANSWER_LENGTH} letters)."
        )
    if len(answer) > MAX_ANSWER_LENGTH:
        raise ValueError(
            f"Answer '{answer}' is too long (maximum {MAX_ANSWER_LENGTH} letters)."
        )
    return answer


def _validate_clue_set(clues):
    seen_answers = set()
    for clue in clues:
        normalized = _normalize_answer(clue.answer)
        if normalized in seen_answers:
            raise ValueError(f"Duplicate answer detected: {normalized}")
        seen_answers.add(normalized)


def _serialize_attempts_with_rank(attempts):
    serializer = AttemptSerializer(attempts, many=True)
    data = serializer.data
    reg_nos = [row.get("student_reg_no") for row in data if row.get("student_reg_no")]
    student_map = {
        s.reg_no: s.name for s in Student.objects.filter(reg_no__in=reg_nos)
    }
    for idx, row in enumerate(data, start=1):
        row["rank"] = idx
        row["student_name"] = student_map.get(row.get("student_reg_no"), "Student")
    return data


def _get_rank_for_attempt(attempt):
    attempts = list(
        Attempt.objects.filter(puzzle=attempt.puzzle).order_by("-score", "completion_time", "submitted_at")
    )
    for idx, item in enumerate(attempts, start=1):
        if item.id == attempt.id:
            return idx
    return None


def _recalculate_puzzle_metrics(puzzle):
    attempts_qs = puzzle.attempts_list.all()
    attempt_count = attempts_qs.count()
    puzzle.attempts = attempt_count
    puzzle.points = (sum(a.score for a in attempts_qs) / attempt_count) if attempt_count > 0 else 0
    metrics = compute_layout_metrics(puzzle.clues.all())
    puzzle.difficulty = compute_difficulty_from_metrics(metrics)
    puzzle.save(update_fields=["attempts", "points", "difficulty"])


def _build_teacher_analytics(puzzles):
    puzzle_summaries = []
    wrong_clue_counter = defaultdict(int)
    total_completion_rate = []

    for puzzle in puzzles:
        attempts = list(puzzle.attempts_list.all())
        attempt_count = len(attempts)
        avg_puzzle_score = round(
            sum(a.score for a in attempts) / attempt_count, 2
        ) if attempt_count > 0 else 0
        avg_completion_time = round(
            sum(a.completion_time for a in attempts) / attempt_count, 2
        ) if attempt_count > 0 else 0
        completion_rate = round(
            (sum(a.solved_words_count for a in attempts) / (attempt_count * max(1, puzzle.clues.count()))) * 100,
            2,
        ) if attempt_count > 0 else 0
        total_completion_rate.append(completion_rate)
        puzzle_summaries.append(
            {
                "puzzle_id": puzzle.id,
                "title": puzzle.title,
                "attempts": attempt_count,
                "average_score": avg_puzzle_score,
                "average_completion_time": avg_completion_time,
                "completion_rate": completion_rate,
            }
        )

        clues = list(puzzle.clues.all())
        for attempt in attempts:
            submitted = attempt.answers or {}
            for clue in clues:
                val = str(submitted.get(str(clue.id), "")).strip().upper()
                if val and val != clue.answer.upper():
                    wrong_clue_counter[clue.id] += 1

    most_incorrect = []
    if wrong_clue_counter:
        clue_by_id = {c.id: c for c in Clue.objects.filter(id__in=wrong_clue_counter.keys())}
        for clue_id, count in sorted(wrong_clue_counter.items(), key=lambda x: x[1], reverse=True)[:10]:
            clue = clue_by_id.get(clue_id)
            if clue:
                most_incorrect.append(
                    {
                        "clue_id": clue.id,
                        "puzzle_id": clue.puzzle_id,
                        "clue": clue.question,
                        "wrong_attempts": count,
                    }
                )

    return {
        "puzzle_stats": puzzle_summaries,
        "average_completion_time": round(
            sum(p["average_completion_time"] for p in puzzle_summaries) / len(puzzle_summaries), 2
        ) if puzzle_summaries else 0,
        "completion_rate": round(
            sum(total_completion_rate) / len(total_completion_rate), 2
        ) if total_completion_rate else 0,
        "most_frequently_incorrect_clues": most_incorrect,
        "most_incorrect_clues": most_incorrect,
    }


@api_view(["GET"])
def puzzle_list(request):
    role = request.query_params.get("role", "Student")
    if role == "Teacher":
        teacher_id = request.query_params.get("teacher_id")
        puzzles = Puzzle.objects.all()
        if teacher_id:
            puzzles = puzzles.filter(teacher__teacher_id=teacher_id)
        puzzles = puzzles.order_by("-created_at")
    else:
        student_reg_no = request.query_params.get("student_reg_no")
        if not student_reg_no:
            return Response({"error": "student_reg_no is required"}, status=400)
        try:
            student = Student.objects.get(reg_no=student_reg_no)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)
        puzzles = Puzzle.objects.filter(status="published", teacher=student.teacher).order_by("-created_at")
    serializer = PuzzleSerializer(puzzles, many=True, context={"role": role})
    return Response(serializer.data)


@api_view(["GET"])
def puzzle_preview(request, puzzle_id):
    role = request.query_params.get("role", "Teacher")
    try:
        puzzle = Puzzle.objects.get(id=puzzle_id)
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)
    return Response(PuzzleSerializer(puzzle, context={"role": role}).data)


@api_view(["GET"])
def stats(request):
    role = request.query_params.get("role", "Student")
    puzzles = Puzzle.objects.all()
    total_puzzles = puzzles.count()
    avg_score = 0
    if total_puzzles > 0:
        avg_score = sum(p.points for p in puzzles) / total_puzzles

    response = {
        "total_puzzles": total_puzzles,
        "assistances": 0,
        "avg_score": f"{avg_score:.0f}%",
        "attainment": f"{avg_score:.0f}%",
    }
    if role == "Teacher":
        response["analytics"] = _build_teacher_analytics(puzzles)
    return Response(response)


@api_view(["GET"])
def puzzle_analytics(request, puzzle_id):
    try:
        puzzle = Puzzle.objects.get(id=puzzle_id)
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)
    return Response(_build_puzzle_analytics_data(puzzle))


def _build_puzzle_analytics_data(puzzle):
    attempts = list(puzzle.attempts_list.all())
    attempt_count = len(attempts)
    avg_score = round(sum(a.score for a in attempts) / attempt_count, 2) if attempt_count else 0
    avg_time = round(sum(a.completion_time for a in attempts) / attempt_count, 2) if attempt_count else 0
    completion_times = [a.completion_time for a in attempts]
    min_time = min(completion_times) if completion_times else 0
    max_time = max(completion_times) if completion_times else 0
    total_hint_letters = sum(a.hint_letters_used for a in attempts)
    total_hint_words = sum(a.hint_words_used for a in attempts)
    completion_rate = round(
        (sum(a.solved_words_count for a in attempts) / (attempt_count * max(1, puzzle.clues.count()))) * 100,
        2,
    ) if attempt_count else 0

    ranked = _serialize_attempts_with_rank(
        Attempt.objects.filter(puzzle=puzzle).order_by("-score", "completion_time", "submitted_at")[:5]
    )
    wrong_clues = defaultdict(int)
    clues = list(puzzle.clues.all())
    for attempt in attempts:
        submitted = attempt.answers or {}
        for clue in clues:
            val = str(submitted.get(str(clue.id), "")).strip().upper()
            if val and val != clue.answer.upper():
                wrong_clues[clue.id] += 1

    hardest = []
    clue_map = {c.id: c for c in clues}
    for clue_id, count in sorted(wrong_clues.items(), key=lambda x: x[1], reverse=True)[:10]:
        clue = clue_map.get(clue_id)
        if clue:
            hardest.append({"clue_id": clue.id, "clue": clue.question, "wrong_attempts": count})

    return {
        "puzzle_id": puzzle.id,
        "title": puzzle.title,
        "total_attempts": attempt_count,
        "average_score": avg_score,
        "average_completion_time": avg_time,
        "completion_time_min": min_time,
        "completion_time_max": max_time,
        "completion_time_avg": avg_time,
        "completion_rate": completion_rate,
        "hint_letters_used": total_hint_letters,
        "hint_words_used": total_hint_words,
        "top_students": ranked,
        "hardest_clues": hardest,
        "most_incorrect_clues": hardest,
    }


@api_view(["GET"])
def analytics(request):
    puzzle_id = request.query_params.get("puzzle_id")
    if not puzzle_id:
        return Response({"error": "puzzle_id query param is required"}, status=400)
    try:
        puzzle = Puzzle.objects.get(id=int(puzzle_id))
    except (ValueError, Puzzle.DoesNotExist):
        return Response({"error": "Puzzle not found"}, status=404)
    return Response(_build_puzzle_analytics_data(puzzle))


@api_view(["POST"])
def submit_puzzle(request):
    payload = request.data.copy()
    logger.warning("submit_puzzle payload=%s", payload)
    puzzle_id = payload.get("puzzle")
    answers = payload.get("answers", {})

    try:
        puzzle = Puzzle.objects.get(id=puzzle_id)
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)

    if puzzle.status != "published":
        return Response({"error": "Puzzle is not available for submission"}, status=400)

    student_reg_no = payload.get("student_reg_no")
    if not student_reg_no:
        return Response({"error": "student_reg_no is required"}, status=400)
    if student_reg_no and Attempt.objects.filter(student_reg_no=student_reg_no, puzzle=puzzle).exists():
        return Response({"error": "Puzzle already submitted"}, status=400)

    clues = list(puzzle.clues.all())
    total_clues = len(clues)
    correct_count = 0
    correct_ids = []
    incorrect_ids = []
    for clue in clues:
        submitted = str(answers.get(str(clue.id), "")).strip().upper()
        if submitted and submitted == clue.answer.upper():
            correct_count += 1
            correct_ids.append(clue.id)
        else:
            incorrect_ids.append(clue.id)

    base_score = (correct_count / total_clues) * 100 if total_clues > 0 else 0
    completion_time = int(payload.get("completion_time") or 0)
    hint_letters = int(payload.get("hint_letters_used") or 0)
    hint_words = int(payload.get("hint_words_used") or 0)
    hint_penalty = min(40, (hint_letters * 2) + (hint_words * 8))
    final_score = max(0, round(base_score - hint_penalty, 2))

    payload["completion_time"] = completion_time
    payload["solved_words_count"] = correct_count
    payload["hint_letters_used"] = hint_letters
    payload["hint_words_used"] = hint_words
    payload["hint_penalty"] = hint_penalty
    payload["score"] = final_score
    payload["result_breakdown"] = {
        "correct_clue_ids": correct_ids,
        "incorrect_clue_ids": incorrect_ids,
    }

    serializer = AttemptSerializer(data=payload)
    if serializer.is_valid():
        attempt = serializer.save()
        _recalculate_puzzle_metrics(puzzle)
        response = AttemptSerializer(attempt).data
        response["rank"] = _get_rank_for_attempt(attempt)
        response["total_words"] = total_clues
        response["correct_words"] = correct_count
        response["incorrect_words"] = total_clues - correct_count
        logger.warning(
            "submit_puzzle success attempt_id=%s puzzle_id=%s score=%s solved_words=%s",
            attempt.id,
            puzzle.id,
            response["score"],
            response["solved_words_count"],
        )
        return Response(response)
    logger.warning("submit_puzzle validation_error=%s", serializer.errors)
    return Response(serializer.errors, status=400)


@api_view(["GET"])
def leaderboard(request):
    attempts = Attempt.objects.order_by("-score", "completion_time", "submitted_at")[:50]
    return Response(_serialize_attempts_with_rank(attempts))


@api_view(["GET"])
def leaderboard_by_puzzle(request, puzzle_id):
    attempts = Attempt.objects.filter(puzzle_id=puzzle_id).order_by("-score", "completion_time", "submitted_at")[:50]
    return Response(_serialize_attempts_with_rank(attempts))


@api_view(["GET"])
def student_history(request):
    reg_no = request.query_params.get("student_reg_no")
    if not reg_no:
        return Response({"error": "student_reg_no is required"}, status=400)

    attempts = list(
        Attempt.objects.filter(student_reg_no=reg_no).order_by("-submitted_at")
    )
    history = []
    for attempt in attempts:
        history.append(
            {
                "attempt_id": attempt.id,
                "puzzle_id": attempt.puzzle_id,
                "puzzle_title": attempt.puzzle.title,
                "submitted_at": attempt.submitted_at,
                "attempt_date": attempt.submitted_at,
                "score": attempt.score,
                "completion_time": attempt.completion_time,
                "solved_words_count": attempt.solved_words_count,
                "rank": _get_rank_for_attempt(attempt),
            }
        )
    return Response(history)


@api_view(["POST"])
def check_answer(request):
    data = request.data
    try:
        puzzle_id = data.get("puzzle_id") or data.get("puzzle")
        if not puzzle_id:
            return Response({"error": "puzzle_id is required"}, status=400)

        puzzle = Puzzle.objects.get(id=puzzle_id)
        clue_id = data.get("clue_id")
        if clue_id:
            clue = puzzle.clues.get(id=clue_id)
        else:
            row = data.get("row")
            col = data.get("col")
            direction = data.get("direction")
            if row is None or col is None or not direction:
                return Response(
                    {"error": "Provide clue_id or row/col/direction for answer check"},
                    status=400,
                )
            clue = puzzle.clues.get(row=row, col=col, direction=direction)

        submitted = str(data.get("answer", "")).strip().upper()
        expected = clue.answer.upper()
        letter_states = []
        for i, expected_ch in enumerate(expected):
            if i < len(submitted):
                letter_states.append(submitted[i] == expected_ch)
            else:
                letter_states.append(None)
        valid = len(submitted) == len(expected) and expected == submitted
        return Response({"valid": valid, "letter_states": letter_states, "answer_length": len(expected)})
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)
    except Clue.DoesNotExist:
        return Response({"error": "Clue not found"}, status=404)
    except (TypeError, ValueError):
        return Response({"error": "Invalid request payload"}, status=400)


@api_view(["POST"])
def reveal_hint(request):
    puzzle_id = request.data.get("puzzle")
    clue_id = request.data.get("clue_id")
    hint_type = request.data.get("hint_type", "letter")
    index = int(request.data.get("index") or 0)
    try:
        clue = Clue.objects.get(id=clue_id, puzzle_id=puzzle_id)
    except Clue.DoesNotExist:
        return Response({"error": "Clue not found"}, status=404)

    if hint_type == "word":
        return Response({"word": clue.answer.upper()})
    if index < 0 or index >= len(clue.answer):
        return Response({"error": "Invalid index"}, status=400)
    return Response({"letter": clue.answer.upper()[index]})


@api_view(["POST"])
def login(request):
    role = request.data.get("role")
    user_id = (request.data.get("user_id") or "").strip()
    password = (request.data.get("password") or "").strip()
    if not role or not user_id or not password:
        return Response({"error": "role, user_id and password are required"}, status=400)

    if role == "Admin":
        user = authenticate(username=user_id, password=password)
        if not user or not user.is_superuser:
            return Response({"error": "Invalid credentials"}, status=401)
        name = user.get_full_name() or user.username
        return Response({"role": "Admin", "user_id": user.username, "name": name})

    if role == "Teacher":
        try:
            teacher = Teacher.objects.get(teacher_id__iexact=user_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=401)
        if teacher.password != password:
            return Response({"error": "Invalid credentials"}, status=401)
        return Response({"role": "Teacher", "user_id": teacher.teacher_id, "name": teacher.name})

    if role == "Student":
        try:
            student = Student.objects.get(reg_no__iexact=user_id)
        except Student.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=401)
        if student.password != password:
            if student.password.endswith("\\") and student.password.rstrip("\\") == password:
                student.password = student.password.rstrip("\\")
                student.save(update_fields=["password"])
            else:
                return Response({"error": "Invalid credentials"}, status=401)
        return Response({"role": "Student", "user_id": student.reg_no, "name": student.name})

    return Response({"error": "Invalid role"}, status=400)


def _regenerate_layout(puzzle):
    _validate_clue_set(puzzle.clues.all())
    placements = generate_crossword_layout(
        [{"clue_id": clue.id, "question": clue.question, "answer": clue.answer} for clue in puzzle.clues.all()]
    )
    if not placements:
        raise ValueError("Unable to generate layout")
    if len(placements) != puzzle.clues.count():
        raise ValueError("Unable to generate crossword layout with given words.")

    try:
        build_letter_grid_from_placements(placements)
    except ValueError:
        raise
    by_id = {item["clue_id"]: item for item in placements}
    for clue in puzzle.clues.all():
        placement = by_id.get(clue.id)
        if not placement:
            continue
        clue.row = placement["row"]
        clue.col = placement["col"]
        clue.direction = placement["direction"]
        clue.answer = placement["answer"]
        clue.save(update_fields=["row", "col", "direction", "answer"])
    _recalculate_puzzle_metrics(puzzle)


@api_view(["POST"])
def create_puzzle(request):
    logger.warning("create_puzzle payload=%s", request.data)
    title = (request.data.get("title") or "").strip()
    teacher_id = request.data.get("teacher_id")
    validation_mode = request.data.get("validation_mode") or "on_submit"
    if not title:
        return Response({"error": "title is required"}, status=400)
    if not teacher_id:
        return Response({"error": "teacher_id is required"}, status=400)

    try:
        teacher = Teacher.objects.get(teacher_id=teacher_id)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)

    puzzle = Puzzle.objects.create(
        title=title,
        teacher=teacher,
        status="draft",
        validation_mode=validation_mode if validation_mode in {"instant", "on_submit"} else "on_submit",
    )
    response_data = PuzzleSerializer(puzzle, context={"role": "Teacher"}).data
    logger.warning("create_puzzle success puzzle_id=%s status=%s", puzzle.id, puzzle.status)
    return Response(response_data, status=201)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def generate_from_document(request):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return Response(
            {"error": "Groq API key not configured. Set GROQ_API_KEY environment variable."},
            status=500,
        )

    teacher_id = (request.data.get("teacher_id") or "").strip()
    puzzle_title = (request.data.get("puzzle_title") or "").strip()
    difficulty = (request.data.get("difficulty") or "medium").lower()
    num_questions = int(request.data.get("num_questions") or 0)
    topic_hint = (request.data.get("topic_hint") or "").strip()
    upload = request.FILES.get("file")

    if not teacher_id:
        return Response({"error": "teacher_id is required"}, status=400)
    if not puzzle_title:
        return Response({"error": "puzzle_title is required"}, status=400)
    if difficulty not in {"easy", "medium", "hard"}:
        return Response({"error": "Invalid difficulty"}, status=400)
    if num_questions < 5 or num_questions > 20:
        return Response({"error": "num_questions must be between 5 and 20"}, status=400)

    try:
        teacher = Teacher.objects.get(teacher_id=teacher_id)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)

    try:
        text = _extract_text_from_upload(upload)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)

    if not text:
        return Response({"error": "Could not extract text from document"}, status=400)

    try:
        pairs = generate_clues_with_groq(text, difficulty, num_questions, topic_hint or None)
    except Exception as exc:
        return Response({"error": str(exc)}, status=500)

    if not isinstance(pairs, list) or len(pairs) == 0:
        return Response(
            {"error": "Document does not contain enough usable content. Please upload a more detailed document."},
            status=400,
        )

    cleaned = []
    seen = set()
    for item in pairs:
        if not isinstance(item, dict):
            continue
        raw_word = str(item.get("word") or "").strip()
        if not raw_word:
            continue
        if not re.fullmatch(r"[A-Za-z]+", raw_word):
            continue
        if len(raw_word) < MIN_ANSWER_LENGTH:
            continue
        word = raw_word.upper()
        if word in seen:
            continue
        clue = (item.get("clue") or "").strip()
        if not clue:
            continue
        cleaned.append((word, clue))
        seen.add(word)

    if len(cleaned) == 0:
        return Response(
            {"error": "Document does not contain enough usable content. Please upload a more detailed document."},
            status=400,
        )

    cleaned.sort(key=lambda item: len(item[0]), reverse=True)
    words_to_try = cleaned[:num_questions]

    puzzle = Puzzle.objects.create(
        title=puzzle_title,
        teacher=teacher,
        status="draft",
        difficulty=difficulty,
        validation_mode="on_submit",
    )

    layout_success = False
    while len(words_to_try) >= 3:
        Clue.objects.filter(puzzle=puzzle).delete()
        for word, clue_text in words_to_try:
            Clue.objects.create(
                puzzle=puzzle,
                question=clue_text,
                answer=word,
                row=0,
                col=0,
                direction="across",
            )
        try:
            _regenerate_layout(puzzle)
            layout_success = True
            break
        except Exception:
            words_to_try = words_to_try[:-2]

    if not layout_success:
        puzzle.delete()
        return Response(
            {"error": "Could not generate a valid crossword. Please try a different document or reduce number of questions."},
            status=500,
        )

    response_data = PuzzleSerializer(puzzle, context={"role": "Teacher"}).data
    if len(words_to_try) < num_questions:
        response_data["warning"] = "Fewer valid terms were found than requested."
    return Response(response_data, status=201)


@api_view(["POST"])
def add_clues(request):
    logger.warning("add_clues payload=%s", request.data)
    puzzle_id = request.data.get("puzzle_id")
    entries = request.data.get("entries", [])
    if not puzzle_id:
        return Response({"error": "puzzle_id is required"}, status=400)
    if not isinstance(entries, list) or len(entries) == 0:
        return Response({"error": "entries must be a non-empty list"}, status=400)

    try:
        puzzle = Puzzle.objects.get(id=puzzle_id)
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)

    if puzzle.status == "archived":
        return Response({"error": "Archived puzzles cannot be edited"}, status=400)

    seen_answers = {c.answer.upper() for c in puzzle.clues.all()}
    incoming_entries = []
    for entry in entries:
        clue_text = (entry.get("clue") or "").strip()
        if not clue_text:
            return Response({"error": "Each entry must include clue text"}, status=400)
        try:
            word = _normalize_answer(entry.get("word"))
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)
        if word in seen_answers:
            return Response({"error": f"Duplicate answer detected: {word}"}, status=400)
        seen_answers.add(word)
        incoming_entries.append((word, clue_text))

    if not incoming_entries:
        return Response({"error": "No valid clue entries provided"}, status=400)

    if puzzle.clues.count() + len(incoming_entries) > 30:
        return Response({"error": "Too many clues. Maximum supported is 30 per puzzle."}, status=400)

    created = []
    created_ids = []
    for word, clue_text in incoming_entries:
        clue = Clue.objects.create(
            puzzle=puzzle,
            question=clue_text,
            answer=word,
            row=0,
            col=0,
            direction="across",
        )
        created.append(clue)
        created_ids.append(clue.id)

    try:
        _regenerate_layout(puzzle)
    except ValueError as exc:
        for clue in created:
            clue.delete()
        logger.warning("add_clues layout_error puzzle_id=%s error=%s", puzzle.id, str(exc))
        return Response({"error": str(exc)}, status=400)

    logger.warning(
        "add_clues success puzzle_id=%s created_ids=%s total_clues=%s",
        puzzle.id,
        created_ids,
        puzzle.clues.count(),
    )
    return Response({"created_clue_ids": created_ids})


@api_view(["POST"])
def update_clue(request, clue_id):
    try:
        clue = Clue.objects.get(id=clue_id)
    except Clue.DoesNotExist:
        return Response({"error": "Clue not found"}, status=404)

    puzzle = clue.puzzle
    if puzzle.status == "archived":
        return Response({"error": "Archived puzzles cannot be edited"}, status=400)

    new_word = request.data.get("answer")
    new_clue = request.data.get("clue")
    if new_word is not None:
        try:
            normalized = _normalize_answer(new_word)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)
        duplicate_exists = puzzle.clues.exclude(id=clue.id).filter(answer__iexact=normalized).exists()
        if duplicate_exists:
            return Response({"error": f"Duplicate answer detected: {normalized}"}, status=400)
        clue.answer = normalized
    if new_clue is not None:
        clue.question = str(new_clue).strip() or clue.question
    clue.save()

    try:
        _regenerate_layout(puzzle)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)

    return Response({"ok": True})


@api_view(["DELETE"])
def delete_clue(request, clue_id):
    try:
        clue = Clue.objects.get(id=clue_id)
    except Clue.DoesNotExist:
        return Response({"error": "Clue not found"}, status=404)

    puzzle = clue.puzzle
    if puzzle.status == "archived":
        return Response({"error": "Archived puzzles cannot be edited"}, status=400)
    clue.delete()
    if puzzle.clues.count() > 0:
        try:
            _regenerate_layout(puzzle)
        except ValueError:
            pass
    else:
        puzzle.difficulty = "easy"
        puzzle.save(update_fields=["difficulty"])
    return Response({"ok": True})


@api_view(["POST"])
def regenerate_layout(request, puzzle_id):
    try:
        puzzle = Puzzle.objects.get(id=puzzle_id)
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)

    if puzzle.clues.count() == 0:
        return Response({"error": "No clues to generate layout"}, status=400)
    try:
        _regenerate_layout(puzzle)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)
    return Response(PuzzleSerializer(puzzle, context={"role": "Teacher"}).data)


@api_view(["POST"])
def publish_puzzle(request):
    logger.warning("publish_puzzle payload=%s", request.data)
    puzzle_id = request.data.get("puzzle_id")
    try:
        puzzle = Puzzle.objects.get(id=puzzle_id)
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)

    if puzzle.clues.count() == 0:
        return Response({"error": "Add at least one clue before publishing"}, status=400)
    try:
        _regenerate_layout(puzzle)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)

    puzzle.status = "published"
    puzzle.save(update_fields=["status"])
    response_data = PuzzleSerializer(puzzle, context={"role": "Teacher"}).data
    logger.warning(
        "publish_puzzle success puzzle_id=%s status=%s clues=%s",
        puzzle.id,
        puzzle.status,
        puzzle.clues.count(),
    )
    return Response(response_data)


@api_view(["POST"])
def archive_puzzle(request, puzzle_id):
    try:
        puzzle = Puzzle.objects.get(id=puzzle_id)
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)
    puzzle.status = "archived"
    puzzle.save(update_fields=["status"])
    return Response({"ok": True, "status": puzzle.status})


@api_view(["DELETE"])
def delete_puzzle(request, puzzle_id):
    try:
        puzzle = Puzzle.objects.get(id=puzzle_id)
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)

    if puzzle.status == "published":
        return Response({"error": "Published puzzles cannot be deleted"}, status=400)

    if puzzle.attempts_list.exists():
        return Response({"error": "Cannot delete a puzzle with attempts"}, status=400)

    puzzle.delete()
    return Response({"ok": True})


@api_view(["GET"])
def printable_export(request, puzzle_id):
    try:
        puzzle = Puzzle.objects.get(id=puzzle_id)
    except Puzzle.DoesNotExist:
        return Response({"error": "Puzzle not found"}, status=404)

    data = PuzzleSerializer(puzzle, context={"role": "Teacher"}).data
    across = data.get("across", [])
    down = data.get("down", [])
    rows = []
    for row in data.get("cells", []):
        tds = []
        for cell in row:
            if not cell:
                tds.append("<td style='width:24px;height:24px;background:#000;'></td>")
            else:
                num = cell.get("number") or ""
                tds.append(
                    "<td style='width:24px;height:24px;border:1px solid #555;position:relative;'>"
                    f"<small style='position:absolute;top:0;left:2px;font-size:9px'>{num}</small>"
                    "</td>"
                )
        rows.append("<tr>" + "".join(tds) + "</tr>")

    across_items = "".join(
        f"<li>{c['number']}. {c['clue']} ({c['length']})</li>" for c in across
    )
    down_items = "".join(
        f"<li>{c['number']}. {c['clue']} ({c['length']})</li>" for c in down
    )

    html = f"""
    <html><body>
    <h2>{puzzle.title}</h2>
    <table style='border-collapse:collapse'>{''.join(rows)}</table>
    <h3>Across</h3>
    <ul>{across_items}</ul>
    <h3>Down</h3>
    <ul>{down_items}</ul>
    </body></html>
    """
    return HttpResponse(html, content_type="text/html")


def _serialize_teacher(teacher):
    return {
        "id": teacher.id,
        "teacher_id": teacher.teacher_id,
        "name": teacher.name,
    }


def _serialize_student(student):
    return {
        "id": student.id,
        "name": student.name,
        "reg_no": student.reg_no,
        "teacher_id": student.teacher.teacher_id if student.teacher else None,
        "teacher_name": student.teacher.name if student.teacher else None,
        "created_at": student.created_at,
    }


@api_view(["GET", "POST"])
def admin_teachers(request):
    if request.method == "GET":
        teachers = Teacher.objects.all().order_by("teacher_id")
        return Response([_serialize_teacher(t) for t in teachers])

    teacher_id = (request.data.get("teacher_id") or "").strip()
    name = (request.data.get("name") or "Teacher").strip()
    password = (request.data.get("password") or "").strip()
    if not teacher_id or not password:
        return Response({"error": "teacher_id and password are required"}, status=400)
    if Teacher.objects.filter(teacher_id=teacher_id).exists():
        return Response({"error": "Teacher ID already exists"}, status=400)
    teacher = Teacher.objects.create(teacher_id=teacher_id, name=name, password=password)
    return Response(_serialize_teacher(teacher), status=201)


@api_view(["DELETE"])
def admin_teacher_detail(request, teacher_id):
    try:
        teacher = Teacher.objects.get(teacher_id=teacher_id)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)
    teacher.delete()
    return Response({"ok": True})


@api_view(["GET"])
def admin_students(request):
    teacher_id = request.query_params.get("teacher_id")
    students = Student.objects.all()
    if teacher_id:
        students = students.filter(teacher__teacher_id=teacher_id)
    students = students.order_by("reg_no")
    return Response([_serialize_student(s) for s in students])


@api_view(["GET"])
def teacher_students(request):
    teacher_id = request.query_params.get("teacher_id")
    if not teacher_id:
        return Response({"error": "teacher_id is required"}, status=400)
    students = Student.objects.filter(teacher__teacher_id=teacher_id).order_by("reg_no")
    return Response([_serialize_student(s) for s in students])


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_students_csv(request):
    teacher_id = request.data.get("teacher_id")
    if not teacher_id:
        return Response({"error": "teacher_id is required"}, status=400)
    try:
        teacher = Teacher.objects.get(teacher_id=teacher_id)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)

    upload = request.FILES.get("file")
    csv_text = request.data.get("csv") if not upload else None
    if not upload and not csv_text:
        return Response({"error": "CSV file is required"}, status=400)

    if upload:
        content = upload.read().decode("utf-8")
    else:
        content = str(csv_text)

    reader = csv.reader(io.StringIO(content))
    created = 0
    skipped = 0
    errors = []
    for idx, row in enumerate(reader, start=1):
        if not row:
            skipped += 1
            continue
        if idx == 1 and row[0].strip().lower() == "name":
            continue
        if len(row) < 3:
            errors.append({"row": idx, "error": "Expected name, reg_no, password"})
            skipped += 1
            continue
        name = row[0].strip()
        reg_no = row[1].strip()
        password = row[2].strip().rstrip("\\")
        if not reg_no or not password:
            errors.append({"row": idx, "error": "reg_no and password are required"})
            skipped += 1
            continue
        if Student.objects.filter(reg_no=reg_no).exists():
            errors.append({"row": idx, "error": f"Duplicate reg_no: {reg_no}"})
            skipped += 1
            continue
        Student.objects.create(name=name or "Student", reg_no=reg_no, password=password, teacher=teacher)
        created += 1

    return Response({"created": created, "skipped": skipped, "errors": errors})


@api_view(["POST"])
def reset_student_password(request, student_id):
    new_password = (request.data.get("password") or "").strip()
    if not new_password:
        return Response({"error": "password is required"}, status=400)
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)
    student.password = new_password
    student.save(update_fields=["password"])
    return Response({"ok": True})


@api_view(["DELETE"])
def delete_student(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)
    student.delete()
    return Response({"ok": True})
