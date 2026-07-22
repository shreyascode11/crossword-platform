from django.db import migrations, models


def hash_existing_passwords(apps, schema_editor):
    from django.contrib.auth.hashers import make_password

    Teacher = apps.get_model('api', 'Teacher')
    Student = apps.get_model('api', 'Student')

    hashed_prefixes = ('pbkdf2_', 'bcrypt', 'argon2', 'scrypt')

    for obj in Teacher.objects.all():
        if not any(obj.password.startswith(p) for p in hashed_prefixes):
            obj.password = make_password(obj.password)
            obj.save(update_fields=['password'])

    for obj in Student.objects.all():
        if not any(obj.password.startswith(p) for p in hashed_prefixes):
            obj.password = make_password(obj.password)
            obj.save(update_fields=['password'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_student_created_at_student_teacher'),
    ]

    operations = [
        # Fix Attempt.student_reg_no length to match Student.reg_no (max_length=50)
        migrations.AlterField(
            model_name='attempt',
            name='student_reg_no',
            field=models.CharField(max_length=50),
        ),
        # Prevent duplicate submissions from the same student on the same puzzle
        migrations.AlterUniqueTogether(
            name='attempt',
            unique_together={('puzzle', 'student_reg_no')},
        ),
        # Auth token table
        migrations.CreateModel(
            name='AuthToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(db_index=True, max_length=64, unique=True)),
                ('role', models.CharField(max_length=20)),
                ('user_id', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        # Hash any plaintext passwords that exist in the DB
        migrations.RunPython(hash_existing_passwords, migrations.RunPython.noop),
    ]
