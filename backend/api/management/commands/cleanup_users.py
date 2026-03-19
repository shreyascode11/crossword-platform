from django.core.management.base import BaseCommand
from api.models import Teacher, Student

class Command(BaseCommand):
    help = "Delete all Teacher and Student records (admin users preserved in auth.User)."

    def handle(self, *args, **options):
        student_count = Student.objects.count()
        teacher_count = Teacher.objects.count()
        Student.objects.all().delete()
        Teacher.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted students: {student_count}"))
        self.stdout.write(self.style.SUCCESS(f"Deleted teachers: {teacher_count}"))
