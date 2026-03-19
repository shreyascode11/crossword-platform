from django.db import models
from django.utils import timezone

class Teacher(models.Model):
    teacher_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100, default="Teacher")
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.teacher_id


class Student(models.Model):
    reg_no = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100, default="Student")
    password = models.CharField(max_length=128)
    teacher = models.ForeignKey(Teacher, related_name='students', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.reg_no


class Puzzle(models.Model):
    VALIDATION_CHOICES = (
        ("instant", "Instant Validation"),
        ("on_submit", "Validate On Submit"),
    )

    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("published", "Published"),
        ("archived", "Archived"),
    )

    title = models.CharField(max_length=200)
    teacher = models.ForeignKey(Teacher, related_name='puzzles', on_delete=models.SET_NULL, null=True, blank=True)
    attempts = models.IntegerField(default=0)
    points = models.FloatField(default=0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="draft")
    difficulty = models.CharField(max_length=20, default="medium")
    validation_mode = models.CharField(max_length=20, choices=VALIDATION_CHOICES, default="on_submit")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class Clue(models.Model):
    puzzle = models.ForeignKey(Puzzle, related_name='clues', on_delete=models.CASCADE)
    question = models.CharField(max_length=500, default="N/A")
    answer = models.CharField(max_length=100)
    row = models.IntegerField()
    col = models.IntegerField()
    direction = models.CharField(max_length=10)  # 'across' or 'down'

    def __str__(self):
        return f"{self.question} ({self.direction})"

class Attempt(models.Model):
    puzzle = models.ForeignKey(Puzzle, related_name='attempts_list', on_delete=models.CASCADE)
    student_reg_no = models.CharField(max_length=20)  # unique student ID
    score = models.FloatField(default=0)
    completion_time = models.IntegerField(default=0)  # seconds
    solved_words_count = models.IntegerField(default=0)
    hint_letters_used = models.IntegerField(default=0)
    hint_words_used = models.IntegerField(default=0)
    hint_penalty = models.FloatField(default=0)
    result_breakdown = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)
    answers = models.JSONField(default=dict)  # e.g., {"0_across": "HELLO", "1_down": "WORLD"}

    def __str__(self):
        return f"{self.student_reg_no} - {self.puzzle.title}"
