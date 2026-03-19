from django.core.management.base import BaseCommand

from api.models import Teacher, Student, Puzzle, Clue


class Command(BaseCommand):
    help = "Seed teacher/student accounts and starter published puzzles."

    def handle(self, *args, **options):
        teacher, _ = Teacher.objects.get_or_create(
            teacher_id="teacher01",
            defaults={"name": "Default Teacher", "password": "teach123"},
        )
        teacher.name = "Default Teacher"
        teacher.password = "teach123"
        teacher.save(update_fields=["name", "password"])

        students = [
            ("21CS001", "Student One"),
            ("21CS002", "Student Two"),
            ("21CS003", "Student Three"),
        ]
        for reg_no, name in students:
            student, _ = Student.objects.get_or_create(
                reg_no=reg_no,
                defaults={"name": name, "password": "stud123"},
            )
            student.name = name
            student.password = "stud123"
            student.save(update_fields=["name", "password"])

        puzzle_specs = [
            (
                "Programming Basics",
                [
                    ("A JavaScript library for UI", "REACT"),
                    ("Structure for key-value data", "MAP"),
                    ("Python web framework in this project", "DJANGO"),
                ],
            ),
            (
                "Computer Science Terms",
                [
                    ("Last-in-first-out structure", "STACK"),
                    ("First-in-first-out structure", "QUEUE"),
                    ("Data travels as packets over this", "NETWORK"),
                ],
            ),
        ]

        for title, entries in puzzle_specs:
            puzzle, _ = Puzzle.objects.get_or_create(
                title=title,
                defaults={"teacher": teacher, "status": "published"},
            )
            puzzle.teacher = teacher
            puzzle.status = "published"
            puzzle.save(update_fields=["teacher", "status"])

            if puzzle.clues.count() == 0:
                for idx, (question, answer) in enumerate(entries):
                    Clue.objects.create(
                        puzzle=puzzle,
                        question=question,
                        answer=answer.upper(),
                        row=idx,
                        col=0,
                        direction="across",
                    )

        self.stdout.write(self.style.SUCCESS("Seeded teacher, students, and starter puzzles."))
