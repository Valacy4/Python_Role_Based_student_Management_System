# accounts/management/commands/seed_test_data.py
from django.core.management.base import BaseCommand
from accounts.models import User
from academics.models import (Department, TeacherProfile,
                               StudentProfile, Subject, Class, Enrollment)
from attendance.models import AttendanceRecord
from grades.models import Grade
from datetime import date


class Command(BaseCommand):
    help = 'Seeds test data without touching existing data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating test data...')

        # ── 1. Department ──────────────────────────────────────────
        dept, _ = Department.objects.get_or_create(name='Information Technology')
        self.stdout.write('  ✓ Department: Information Technology')

        # ── 2. Users ───────────────────────────────────────────────
        # HOD
        hod_user, created = User.objects.get_or_create(
            username='test_hod',
            defaults={
                'email':      'test_hod@sms.com',
                'first_name': 'Meera',
                'last_name':  'Nair',
                'role':       'hod',
                'phone':      '9000000001',
            }
        )
        if created:
            hod_user.set_password('Test@1234')
            hod_user.save()
        self.stdout.write('  ✓ HOD user: test_hod')

        # Assign HOD to department
        dept.hod = hod_user
        dept.save()

        # Teacher 1
        teacher1, created = User.objects.get_or_create(
            username='test_teacher1',
            defaults={
                'email':      'test_teacher1@sms.com',
                'first_name': 'Arjun',
                'last_name':  'Menon',
                'role':       'teacher',
                'phone':      '9000000002',
            }
        )
        if created:
            teacher1.set_password('Test@1234')
            teacher1.save()
        self.stdout.write('  ✓ Teacher 1: test_teacher1')

        # Teacher 2
        teacher2, created = User.objects.get_or_create(
            username='test_teacher2',
            defaults={
                'email':      'test_teacher2@sms.com',
                'first_name': 'Sneha',
                'last_name':  'Pillai',
                'role':       'teacher',
                'phone':      '9000000003',
            }
        )
        if created:
            teacher2.set_password('Test@1234')
            teacher2.save()
        self.stdout.write('  ✓ Teacher 2: test_teacher2')

        # Students
        student_data = [
            ('test_student1', 'Rahul',   'Das',    'IT2023001'),
            ('test_student2', 'Anjali',  'Verma',  'IT2023002'),
            ('test_student3', 'Kiran',   'Raj',    'IT2023003'),
        ]
        students = []
        for username, first, last, roll in student_data:
            u, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email':      f'{username}@sms.com',
                    'first_name': first,
                    'last_name':  last,
                    'role':       'student',
                }
            )
            if created:
                u.set_password('Test@1234')
                u.save()
            students.append((u, roll))
        self.stdout.write('  ✓ 3 student users created')

        # ── 3. Teacher Profiles ────────────────────────────────────
        hod_profile, _ = TeacherProfile.objects.get_or_create(
            user=hod_user,
            defaults={
                'department':     dept,
                'employee_id':    'IT_EMP001',
                'specialization': 'Software Engineering',
            }
        )

        t1_profile, _ = TeacherProfile.objects.get_or_create(
            user=teacher1,
            defaults={
                'department':     dept,
                'employee_id':    'IT_EMP002',
                'specialization': 'Web Development',
            }
        )

        t2_profile, _ = TeacherProfile.objects.get_or_create(
            user=teacher2,
            defaults={
                'department':     dept,
                'employee_id':    'IT_EMP003',
                'specialization': 'Networks',
            }
        )
        self.stdout.write('  ✓ Teacher profiles created')

        # ── 4. Student Profiles ────────────────────────────────────
        student_profiles = []
        for i, (u, roll) in enumerate(students):
            sp, _ = StudentProfile.objects.get_or_create(
                user=u,
                defaults={
                    'department':  dept,
                    'roll_number': roll,
                    'semester':    2,
                    'batch_year':  2023,
                }
            )
            student_profiles.append(sp)
        self.stdout.write('  ✓ Student profiles created')

        # ── 5. Subjects ────────────────────────────────────────────
        subjects_data = [
            ('Python Programming', 'IT201', 2, 4),
            ('Computer Networks',  'IT202', 2, 3),
            ('Web Technologies',   'IT203', 2, 3),
        ]
        subjects = []
        for name, code, sem, credits in subjects_data:
            subj, _ = Subject.objects.get_or_create(
                code=code,
                defaults={
                    'name':       name,
                    'department': dept,
                    'semester':   sem,
                    'credits':    credits,
                }
            )
            subjects.append(subj)
        self.stdout.write('  ✓ 3 subjects created')

        # ── 6. Classes ─────────────────────────────────────────────
        # HOD teaches Python, Teacher1 teaches Networks, Teacher2 teaches Web
        classes_data = [
            (subjects[0], hod_profile),   # Python → HOD
            (subjects[1], t1_profile),    # Networks → Teacher1
            (subjects[2], t2_profile),    # Web Tech → Teacher2
        ]
        classes = []
        for subj, teacher in classes_data:
            cls, _ = Class.objects.get_or_create(
                subject=subj,
                teacher=teacher,
                academic_year='2024-25',
                defaults={'is_active': True}
            )
            classes.append(cls)
        self.stdout.write('  ✓ 3 classes created')

        # ── 7. Enrollments ─────────────────────────────────────────
        # All 3 students enrolled in all 3 classes
        enrollments = []
        for sp in student_profiles:
            for cls in classes:
                en, _ = Enrollment.objects.get_or_create(
                    student=sp,
                    cls=cls
                )
                enrollments.append(en)
        self.stdout.write('  ✓ 9 enrollments created (3 students x 3 classes)')

        # ── 8. Attendance Records ──────────────────────────────────
        attendance_data = [
            (date(2025, 1, 6),  'present'),
            (date(2025, 1, 7),  'present'),
            (date(2025, 1, 8),  'absent'),
            (date(2025, 1, 9),  'present'),
            (date(2025, 1, 10), 'late'),
        ]
        for en in enrollments:
            for d, status in attendance_data:
                AttendanceRecord.objects.get_or_create(
                    enrollment=en,
                    date=d,
                    defaults={
                        'status':    status,
                        'marked_by': en.cls.teacher.user,
                    }
                )
        self.stdout.write('  ✓ Attendance records created')

        # ── 9. Grades ──────────────────────────────────────────────
        import random
        exam_types = [
            ('internal1',  50),
            ('internal2',  50),
            ('assignment', 20),
        ]
        for en in enrollments:
            for exam_type, max_marks in exam_types:
                Grade.objects.get_or_create(
                    enrollment=en,
                    exam_type=exam_type,
                    defaults={
                        'marks':     round(random.uniform(
                                         max_marks * 0.5,
                                         max_marks), 2),
                        'max_marks': max_marks,
                        'remarks':   'Test data',
                    }
                )
        self.stdout.write('  ✓ Grades created')

        # ── Summary ────────────────────────────────────────────────
        self.stdout.write(self.style.SUCCESS('''
Test data created successfully!
─────────────────────────────────────────
Role        Username          Password
─────────────────────────────────────────
HOD         test_hod          Test@1234
Teacher     test_teacher1     Test@1234
Teacher     test_teacher2     Test@1234
Student     test_student1     Test@1234
Student     test_student2     Test@1234
Student     test_student3     Test@1234
─────────────────────────────────────────
Department: Information Technology
Subjects:   IT201, IT202, IT203
        '''))