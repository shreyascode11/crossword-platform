from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple

MIN_WORD_LENGTH = 3


@dataclass
class Placement:
    clue_id: int
    answer: str
    row: int
    col: int
    direction: str  # "across" | "down"
    question: str


def _cell_at(p: Placement, index: int) -> Tuple[int, int]:
    if p.direction == "across":
        return p.row, p.col + index
    return p.row + index, p.col


def _build_occupied(placements: Iterable[Placement]) -> Dict[Tuple[int, int], str]:
    occupied: Dict[Tuple[int, int], str] = {}
    for p in placements:
        for i, ch in enumerate(p.answer):
            occupied[_cell_at(p, i)] = ch
    return occupied


def _placement_cells(row: int, col: int, direction: str, length: int) -> List[Tuple[int, int]]:
    if direction == "across":
        return [(row, col + i) for i in range(length)]
    return [(row + i, col) for i in range(length)]


def _can_place(
    answer: str,
    row: int,
    col: int,
    direction: str,
    occupied: Dict[Tuple[int, int], str],
    placements: List[Placement],
) -> Optional[int]:
    length = len(answer)
    candidate_cells = _placement_cells(row, col, direction, length)

    # Prevent overlap in same direction.
    for p in placements:
        if p.direction != direction:
            continue
        existing_cells = set(_placement_cells(p.row, p.col, p.direction, len(p.answer)))
        if existing_cells.intersection(candidate_cells):
            return None

    # Keep cell before start and after end empty.
    before = (row, col - 1) if direction == "across" else (row - 1, col)
    after = (row, col + length) if direction == "across" else (row + length, col)
    if before in occupied or after in occupied:
        return None

    intersections = 0
    for i, (r, c) in enumerate(candidate_cells):
        ch = answer[i]
        existing = occupied.get((r, c))
        if existing is not None:
            if existing != ch:
                return None
            intersections += 1
            continue

        # Avoid side adjacency without intersection.
        if direction == "across":
            if (r - 1, c) in occupied or (r + 1, c) in occupied:
                return None
        else:
            if (r, c - 1) in occupied or (r, c + 1) in occupied:
                return None

    if placements and intersections == 0:
        return None

    return intersections


def _score_candidate(
    placements: List[Placement],
    answer: str,
    row: int,
    col: int,
    direction: str,
    intersections: int,
) -> Tuple[int, int]:
    test = placements + [Placement(0, answer, row, col, direction, "")]
    all_cells: List[Tuple[int, int]] = []
    for p in test:
        all_cells.extend(_placement_cells(p.row, p.col, p.direction, len(p.answer)))
    rows = [r for r, _ in all_cells]
    cols = [c for _, c in all_cells]
    area = (max(rows) - min(rows) + 1) * (max(cols) - min(cols) + 1)
    return (intersections, -area)


def generate_crossword_layout(entries: List[dict]) -> List[dict]:
    normalized = []
    seen_answers = set()
    for entry in entries:
        answer = "".join(ch for ch in str(entry.get("answer", "")).upper() if ch.isalpha())
        if not answer:
            continue
        if len(answer) < MIN_WORD_LENGTH:
            raise ValueError(
                f"Answer '{answer}' is too short. Minimum length is {MIN_WORD_LENGTH} letters."
            )
        if answer in seen_answers:
            raise ValueError(f"Duplicate answer detected: {answer}")
        seen_answers.add(answer)
        normalized.append(
            {
                "clue_id": entry["clue_id"],
                "question": entry.get("question") or "N/A",
                "answer": answer,
            }
        )

    normalized.sort(key=lambda item: len(item["answer"]), reverse=True)
    if not normalized:
        return []

    placements: List[Placement] = []
    occupied: Dict[Tuple[int, int], str] = {}

    first = normalized[0]
    placements.append(
        Placement(
            clue_id=first["clue_id"],
            answer=first["answer"],
            row=0,
            col=0,
            direction="across",
            question=first["question"],
        )
    )
    for i, ch in enumerate(first["answer"]):
        occupied[(0, i)] = ch

    for entry in normalized[1:]:
        answer = entry["answer"]
        best: Optional[Tuple[int, int, str, int]] = None

        # Build positions of existing letters for fast lookup.
        letter_positions: Dict[str, List[Tuple[int, int]]] = {}
        for (r, c), ch in occupied.items():
            letter_positions.setdefault(ch, []).append((r, c))

        for i, ch in enumerate(answer):
            for r, c in letter_positions.get(ch, []):
                for candidate_direction in ("across", "down"):
                    target_row = r - (i if candidate_direction == "down" else 0)
                    target_col = c - (i if candidate_direction == "across" else 0)
                    intersections = _can_place(
                        answer,
                        target_row,
                        target_col,
                        candidate_direction,
                        occupied,
                        placements,
                    )
                    if intersections is None:
                        continue
                    candidate_score = _score_candidate(
                        placements,
                        answer,
                        target_row,
                        target_col,
                        candidate_direction,
                        intersections,
                    )
                    if best is None or candidate_score > (best[0], best[1]):
                        best = (candidate_score[0], candidate_score[1], candidate_direction, target_row, target_col)

        if best is None:
            raise ValueError("Unable to generate crossword layout with given words.")

        direction = best[2]
        row, col = best[3], best[4]
        placements.append(
            Placement(
                clue_id=entry["clue_id"],
                answer=answer,
                row=row,
                col=col,
                direction=direction,
                question=entry["question"],
            )
        )
        for i, ch in enumerate(answer):
            r = row + (i if direction == "down" else 0)
            c = col + (i if direction == "across" else 0)
            occupied[(r, c)] = ch

    # Validate final grid integrity.
    if len(placements) != len(normalized):
        raise ValueError("Unable to generate crossword layout with given words.")
    for p in placements:
        for idx, ch in enumerate(p.answer):
            r, c = _cell_at(p, idx)
            if occupied.get((r, c)) != ch:
                raise ValueError("Unable to generate crossword layout with given words.")

    # Shift coordinates to positive with padding.
    all_cells = []
    for p in placements:
        for idx in range(len(p.answer)):
            all_cells.append(_cell_at(p, idx))
    min_row = min(r for r, _ in all_cells)
    min_col = min(c for _, c in all_cells)
    shift_row = 1 - min_row
    shift_col = 1 - min_col

    output = []
    for p in placements:
        output.append(
            {
                "clue_id": p.clue_id,
                "answer": p.answer,
                "question": p.question,
                "row": p.row + shift_row,
                "col": p.col + shift_col,
                "direction": p.direction,
            }
        )
    _validate_output_layout(output)
    return output


def build_letter_grid_from_placements(placements: List[dict]) -> List[List[str]]:
    if not placements:
        return [[""]]

    min_row = None
    max_row = None
    min_col = None
    max_col = None
    for p in placements:
        length = len(p.get("answer") or "")
        if length == 0:
            continue
        if p.get("direction") == "down":
            end_row = p["row"] + length - 1
            end_col = p["col"]
        else:
            end_row = p["row"]
            end_col = p["col"] + length - 1
        min_row = p["row"] if min_row is None else min(min_row, p["row"])
        min_col = p["col"] if min_col is None else min(min_col, p["col"])
        max_row = end_row if max_row is None else max(max_row, end_row)
        max_col = end_col if max_col is None else max(max_col, end_col)

    min_row = min_row if min_row is not None else 0
    min_col = min_col if min_col is not None else 0
    max_row = max_row if max_row is not None else 0
    max_col = max_col if max_col is not None else 0

    height = max_row - min_row + 1
    width = max_col - min_col + 1
    grid = [["" for _ in range(width)] for _ in range(height)]

    for p in placements:
        answer = p.get("answer") or ""
        for idx, ch in enumerate(answer):
            r = p["row"] + (idx if p.get("direction") == "down" else 0)
            c = p["col"] + (idx if p.get("direction") == "across" else 0)
            rr = r - min_row
            cc = c - min_col
            existing = grid[rr][cc]
            if existing and existing != ch:
                raise ValueError("Unable to generate crossword layout with given words.")
            grid[rr][cc] = ch

    return grid


def _validate_output_layout(placements: List[dict]) -> None:
    if not placements:
        return

    grid = build_letter_grid_from_placements(placements)

    min_row = min(p["row"] for p in placements)
    min_col = min(p["col"] for p in placements)

    for p in placements:
        answer = p.get("answer") or ""
        for idx, ch in enumerate(answer):
            r = p["row"] + (idx if p.get("direction") == "down" else 0)
            c = p["col"] + (idx if p.get("direction") == "across" else 0)
            rr = r - min_row
            cc = c - min_col
            if rr < 0 or cc < 0 or rr >= len(grid) or cc >= len(grid[0]):
                raise ValueError("Unable to generate crossword layout with given words.")
            if grid[rr][cc] != ch:
                raise ValueError("Unable to generate crossword layout with given words.")


def build_grid_from_clues(clues: Iterable) -> Tuple[int, List[List[Optional[dict]]], Dict[int, int], Dict[int, Tuple[int, int]]]:
    clue_list = list(clues)
    if not clue_list:
        return 1, [[None]], {}, {}

    occupied = set()
    for clue in clue_list:
        for i in range(len(clue.answer)):
            r = clue.row + (i if clue.direction == "down" else 0)
            c = clue.col + (i if clue.direction == "across" else 0)
            occupied.add((r, c))

    min_row = min(r for r, _ in occupied)
    max_row = max(r for r, _ in occupied)
    min_col = min(c for _, c in occupied)
    max_col = max(c for _, c in occupied)
    height = max_row - min_row + 3
    width = max_col - min_col + 3
    grid_size = max(height, width)

    row_offset = 1 - min_row
    col_offset = 1 - min_col

    occupied_shifted = {
        (r + row_offset, c + col_offset) for r, c in occupied
    }

    starts_set = set()
    for clue in clue_list:
        sr = clue.row + row_offset
        sc = clue.col + col_offset
        if clue.direction == "across":
            prev = (sr, sc - 1)
            is_start = sc == 0 or prev not in occupied_shifted
        else:
            prev = (sr - 1, sc)
            is_start = sr == 0 or prev not in occupied_shifted
        if is_start:
            starts_set.add((sr, sc))
    starts = sorted(starts_set)
    number_map: Dict[Tuple[int, int], int] = {cell: idx + 1 for idx, cell in enumerate(starts)}
    clue_number_by_id: Dict[int, int] = {}
    clue_coords_by_id: Dict[int, Tuple[int, int]] = {}
    for clue in clue_list:
        shifted = (clue.row + row_offset, clue.col + col_offset)
        clue_number_by_id[clue.id] = number_map[shifted]
        clue_coords_by_id[clue.id] = shifted

    cells: List[List[Optional[dict]]] = [[None for _ in range(grid_size)] for _ in range(grid_size)]
    for r, c in occupied:
        rr, cc = r + row_offset, c + col_offset
        cells[rr][cc] = {"number": number_map.get((rr, cc))}

    return grid_size, cells, clue_number_by_id, clue_coords_by_id


def compute_layout_metrics(clues: Iterable) -> Dict[str, float]:
    clue_list = list(clues)
    if not clue_list:
        return {
            "grid_size": 1,
            "total_words": 0,
            "avg_word_length": 0,
            "intersection_density": 0,
        }

    occupied = {}
    total_letters = 0
    total_word_len = 0
    for clue in clue_list:
        answer_len = len(clue.answer or "")
        total_letters += answer_len
        total_word_len += answer_len
        for i in range(answer_len):
            r = clue.row + (i if clue.direction == "down" else 0)
            c = clue.col + (i if clue.direction == "across" else 0)
            occupied[(r, c)] = occupied.get((r, c), 0) + 1

    intersections = sum(1 for count in occupied.values() if count > 1)
    grid_size, _, _, _ = build_grid_from_clues(clue_list)
    avg_word_length = total_word_len / len(clue_list) if clue_list else 0
    intersection_density = intersections / max(1, total_letters)
    return {
        "grid_size": grid_size,
        "total_words": len(clue_list),
        "avg_word_length": avg_word_length,
        "intersection_density": intersection_density,
    }


def compute_difficulty_from_metrics(metrics: Dict[str, float]) -> str:
    avg_len = metrics.get("avg_word_length", 0)
    grid_size = metrics.get("grid_size", 1)
    density = metrics.get("intersection_density", 0)
    score = avg_len * 0.5 + grid_size * 0.3 + (1 - density) * 10 * 0.2
    if score < 6:
        return "easy"
    if score < 9:
        return "medium"
    return "hard"
