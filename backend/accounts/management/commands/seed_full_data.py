# accounts/management/commands/seed_full_data.py
from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from academics.models import (Department, TeacherProfile,
                               StudentProfile, Subject, Class, Enrollment)
from attendance.models import AttendanceRecord
from grades.models import Grade
from datetime import date, timedelta
import random

# ── DATA DEFINITIONS ──────────────────────────────────────────────────────────

DEPARTMENTS = [
    {
        'name': 'Computer Science',
        'code': 'CS',
        'hod': {
            'first_name': 'Rajesh',
            'last_name':  'Kumar',
            'employee_id': 'CS_HOD001',
            'specialization': 'Artificial Intelligence',
        },
        'subjects': [
            ('Data Structures',          'CS301', 3, 4),
            ('Database Management',      'CS302', 3, 3),
            ('Operating Systems',        'CS303', 3, 3),
            ('Computer Networks',        'CS401', 4, 3),
            ('Software Engineering',     'CS402', 4, 4),
        ],
        'teachers': [
            ('Priya',    'Sharma',   'CS_T001', 'Data Structures'),
            ('Ankit',    'Verma',    'CS_T002', 'Database Systems'),
            ('Meera',    'Nair',     'CS_T003', 'Operating Systems'),
            ('Suresh',   'Pillai',   'CS_T004', 'Computer Networks'),
            ('Divya',    'Menon',    'CS_T005', 'Software Engineering'),
        ],
        'students': [
            ('Arun',     'Das',      'CS2022001', 3, 2022),
            ('Anjali',   'Thomas',   'CS2022002', 3, 2022),
            ('Kiran',    'Raj',      'CS2022003', 3, 2022),
            ('Sneha',    'George',   'CS2022004', 3, 2022),
            ('Rohit',    'Menon',    'CS2022005', 3, 2022),
            ('Pratha',   'Singh',    'CS2022006', 3, 2022),
            ('Vijay',    'Kumar',    'CS2022007', 3, 2022),
            ('Lakshmi',  'Iyer',     'CS2022008', 3, 2022),
            ('Manoj',    'Pillai',   'CS2022009', 3, 2022),
            ('Deepa',    'Nair',     'CS2022010', 3, 2022),
            ('Arjun',    'Krishnan', 'CS2023001', 1, 2023),
            ('Pooja',    'Varma',    'CS2023002', 1, 2023),
            ('Rahul',    'Das',      'CS2023003', 1, 2023),
            ('Nisha',    'Menon',    'CS2023004', 1, 2023),
            ('Sanjay',   'Tiwari',   'CS2023005', 1, 2023),
            ('Riya',     'Sharma',   'CS2023006', 1, 2023),
            ('Vivek',    'Nair',     'CS2023007', 1, 2023),
            ('Ananya',   'Pillai',   'CS2023008', 1, 2023),
            ('Suraj',    'Kumar',    'CS2023009', 1, 2023),
            ('Kavya',    'Thomas',   'CS2023010', 1, 2023),
        ],
    },
    {
        'name': 'Information Technology',
        'code': 'IT',
        'hod': {
            'first_name': 'Meera',
            'last_name':  'Nair',
            'employee_id': 'IT_HOD001',
            'specialization': 'Cloud Computing',
        },
        'subjects': [
            ('Python Programming',       'IT201', 2, 4),
            ('Web Technologies',         'IT202', 2, 3),
            ('Computer Networks',        'IT301', 3, 3),
            ('Information Security',     'IT302', 3, 4),
            ('Cloud Computing',          'IT401', 4, 3),
        ],
        'teachers': [
            ('Arjun',    'Menon',    'IT_T001', 'Python Programming'),
            ('Sneha',    'Pillai',   'IT_T002', 'Web Technologies'),
            ('Karthik',  'Raj',      'IT_T003', 'Computer Networks'),
            ('Divya',    'Das',      'IT_T004', 'Information Security'),
            ('Rahul',    'Varma',    'IT_T005', 'Cloud Computing'),
        ],
        'students': [
            ('Aditya',   'Kumar',    'IT2022001', 3, 2022),
            ('Bhavya',   'Sharma',   'IT2022002', 3, 2022),
            ('Chetan',   'Nair',     'IT2022003', 3, 2022),
            ('Diya',     'Thomas',   'IT2022004', 3, 2022),
            ('Eshan',    'Menon',    'IT2022005', 3, 2022),
            ('Fatima',   'Pillai',   'IT2022006', 3, 2022),
            ('Ganesh',   'Iyer',     'IT2022007', 3, 2022),
            ('Harini',   'Das',      'IT2022008', 3, 2022),
            ('Ishaan',   'Raj',      'IT2022009', 3, 2022),
            ('Jyoti',    'Singh',    'IT2022010', 3, 2022),
            ('Kartik',   'Krishnan', 'IT2023001', 1, 2023),
            ('Lavanya',  'Varma',    'IT2023002', 1, 2023),
            ('Mohit',    'Kumar',    'IT2023003', 1, 2023),
            ('Nandita',  'Nair',     'IT2023004', 1, 2023),
            ('Om',       'Thomas',   'IT2023005', 1, 2023),
            ('Pallavi',  'Menon',    'IT2023006', 1, 2023),
            ('Qusain',   'Pillai',   'IT2023007', 1, 2023),
            ('Roshni',   'Das',      'IT2023008', 1, 2023),
            ('Samir',    'Raj',      'IT2023009', 1, 2023),
            ('Tanvi',    'Sharma',   'IT2023010', 1, 2023),
        ],
    },
    {
        'name': 'Electronics Engineering',
        'code': 'EC',
        'hod': {
            'first_name': 'Suresh',
            'last_name':  'Pillai',
            'employee_id': 'EC_HOD001',
            'specialization': 'VLSI Design',
        },
        'subjects': [
            ('Circuit Theory',           'EC201', 2, 4),
            ('Digital Electronics',      'EC202', 2, 3),
            ('Signals and Systems',      'EC301', 3, 4),
            ('Microprocessors',          'EC302', 3, 3),
            ('Embedded Systems',         'EC401', 4, 4),
        ],
        'teachers': [
            ('Vikram',   'Sharma',   'EC_T001', 'Circuit Theory'),
            ('Anitha',   'Nair',     'EC_T002', 'Digital Electronics'),
            ('Rajan',    'Pillai',   'EC_T003', 'Signals and Systems'),
            ('Kavitha',  'Thomas',   'EC_T004', 'Microprocessors'),
            ('Deepak',   'Menon',    'EC_T005', 'Embedded Systems'),
        ],
        'students': [
            ('Abhay',    'Kumar',    'EC2022001', 3, 2022),
            ('Bindhu',   'Sharma',   'EC2022002', 3, 2022),
            ('Chirag',   'Nair',     'EC2022003', 3, 2022),
            ('Dhanya',   'Thomas',   'EC2022004', 3, 2022),
            ('Elvin',    'Menon',    'EC2022005', 3, 2022),
            ('Feba',     'Pillai',   'EC2022006', 3, 2022),
            ('Girish',   'Iyer',     'EC2022007', 3, 2022),
            ('Hema',     'Das',      'EC2022008', 3, 2022),
            ('Ivan',     'Raj',      'EC2022009', 3, 2022),
            ('Jasna',    'Singh',    'EC2022010', 3, 2022),
            ('Kishore',  'Krishnan', 'EC2023001', 1, 2023),
            ('Lekha',    'Varma',    'EC2023002', 1, 2023),
            ('Manu',     'Kumar',    'EC2023003', 1, 2023),
            ('Neha',     'Nair',     'EC2023004', 1, 2023),
            ('Oscar',    'Thomas',   'EC2023005', 1, 2023),
            ('Parvathy', 'Menon',    'EC2023006', 1, 2023),
            ('Qiran',    'Pillai',   'EC2023007', 1, 2023),
            ('Remya',    'Das',      'EC2023008', 1, 2023),
            ('Sonu',     'Raj',      'EC2023009', 1, 2023),
            ('Tara',     'Sharma',   'EC2023010', 1, 2023),
        ],
    },
    {
        'name': 'Mechanical Engineering',
        'code': 'ME',
        'hod': {
            'first_name': 'Anitha',
            'last_name':  'Thomas',
            'employee_id': 'ME_HOD001',
            'specialization': 'Thermodynamics',
        },
        'subjects': [
            ('Engineering Mechanics',    'ME201', 2, 4),
            ('Thermodynamics',           'ME202', 2, 4),
            ('Fluid Mechanics',          'ME301', 3, 3),
            ('Machine Design',           'ME302', 3, 4),
            ('Manufacturing Processes',  'ME401', 4, 3),
        ],
        'teachers': [
            ('Prasad',   'Kumar',    'ME_T001', 'Engineering Mechanics'),
            ('Radha',    'Sharma',   'ME_T002', 'Thermodynamics'),
            ('Sathish',  'Nair',     'ME_T003', 'Fluid Mechanics'),
            ('Tinu',     'Thomas',   'ME_T004', 'Machine Design'),
            ('Uday',     'Menon',    'ME_T005', 'Manufacturing Processes'),
        ],
        'students': [
            ('Akash',    'Kumar',    'ME2022001', 3, 2022),
            ('Beena',    'Sharma',   'ME2022002', 3, 2022),
            ('Cibin',    'Nair',     'ME2022003', 3, 2022),
            ('Deepthi',  'Thomas',   'ME2022004', 3, 2022),
            ('Edwin',    'Menon',    'ME2022005', 3, 2022),
            ('Fathima',  'Pillai',   'ME2022006', 3, 2022),
            ('Gopal',    'Iyer',     'ME2022007', 3, 2022),
            ('Haritha',  'Das',      'ME2022008', 3, 2022),
            ('Irfan',    'Raj',      'ME2022009', 3, 2022),
            ('Jisha',    'Singh',    'ME2022010', 3, 2022),
            ('Krishnan', 'Krishnan', 'ME2023001', 1, 2023),
            ('Lissy',    'Varma',    'ME2023002', 1, 2023),
            ('Midhun',   'Kumar',    'ME2023003', 1, 2023),
            ('Nimisha',  'Nair',     'ME2023004', 1, 2023),
            ('Ojas',     'Thomas',   'ME2023005', 1, 2023),
            ('Preethi',  'Menon',    'ME2023006', 1, 2023),
            ('Quamar',   'Pillai',   'ME2023007', 1, 2023),
            ('Reshma',   'Das',      'ME2023008', 1, 2023),
            ('Shibu',    'Raj',      'ME2023009', 1, 2023),
            ('Teena',    'Sharma',   'ME2023010', 1, 2023),
        ],
    },
]

# Attendance dates — last 10 working days
def get_attendance_dates():
    dates = []
    d = date(2025, 1, 6)
    while len(dates) < 10:
        if d.weekday() < 5:   # Monday to Friday only
            dates.append(d)
        d += timedelta(days=1)
    return dates

# Random attendance pattern — realistic distribution
def random_status():
    return random.choices(
        ['present', 'present', 'present', 'absent', 'late'],
        weights=[60, 60, 60, 15, 5],
        k=1
    )[0]


class Command(BaseCommand):
    help = 'Seeds full production data — 1 principal, 4 depts, 4 HODs, 20 teachers, 80 students'

    @transaction.atomic   # if anything fails, rolls back everything
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Starting full data seed...'))
        self.stdout.write(self.style.WARNING('This will take about 30 seconds.\n'))

        # ── 1. Principal ───────────────────────────────────────────
        principal, created = User.objects.get_or_create(
            username='principal',
            defaults={
                'email':      'principal@sms.com',
                'first_name': 'Dr. Ramesh',
                'last_name':  'Sharma',
                'role':       'principal',
                'phone':      '9800000001',
                'is_staff':   True,
            }
        )
        if created:
            principal.set_password('Principal@1234')
            principal.save()
        self.stdout.write(f'  ✓ Principal: principal@sms.com')

        # ── 2. Loop through each department ───────────────────────
        for dept_data in DEPARTMENTS:
            self.stdout.write(f'\n  Processing {dept_data["name"]}...')
            code = dept_data['code']

            # Create department (without HOD first)
            dept, _ = Department.objects.get_or_create(
                name=dept_data['name']
            )

            # ── HOD user ──────────────────────────────────────────
            hod_info = dept_data['hod']
            hod_username = f'hod_{code.lower()}'
            hod_user, created = User.objects.get_or_create(
                username=hod_username,
                defaults={
                    'email':      f'{hod_username}@sms.com',
                    'first_name': hod_info['first_name'],
                    'last_name':  hod_info['last_name'],
                    'role':       'hod',
                    'phone':      f'980000{len(hod_username):04d}',
                }
            )
            if created:
                hod_user.set_password('Hod@1234')
                hod_user.save()

            # Assign HOD to department
            dept.hod = hod_user
            dept.save()

            # HOD teacher profile
            hod_profile, _ = TeacherProfile.objects.get_or_create(
                user=hod_user,
                defaults={
                    'department':     dept,
                    'employee_id':    hod_info['employee_id'],
                    'specialization': hod_info['specialization'],
                }
            )
            self.stdout.write(f'    ✓ HOD: {hod_user.get_full_name()}')

            # ── Subjects ──────────────────────────────────────────
            subjects = []
            for name, subj_code, sem, credits in dept_data['subjects']:
                subj, _ = Subject.objects.get_or_create(
                    code=subj_code,
                    defaults={
                        'name':       name,
                        'department': dept,
                        'semester':   sem,
                        'credits':    credits,
                    }
                )
                subjects.append(subj)
            self.stdout.write(f'    ✓ {len(subjects)} subjects created')

            # ── Teachers ──────────────────────────────────────────
            teacher_profiles = []
            for i, (first, last, emp_id, spec) in enumerate(dept_data['teachers']):
                username = f'teacher_{code.lower()}_{i+1}'
                t_user, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'email':      f'{username}@sms.com',
                        'first_name': first,
                        'last_name':  last,
                        'role':       'teacher',
                        'phone':      f'97{i:08d}',
                    }
                )
                if created:
                    t_user.set_password('Teacher@1234')
                    t_user.save()

                t_profile, _ = TeacherProfile.objects.get_or_create(
                    user=t_user,
                    defaults={
                        'department':     dept,
                        'employee_id':    emp_id,
                        'specialization': spec,
                    }
                )
                teacher_profiles.append(t_profile)
            self.stdout.write(f'    ✓ {len(teacher_profiles)} teachers created')

            # ── Classes ───────────────────────────────────────────
            # HOD teaches subject[0], each teacher teaches one subject
            all_teachers = [hod_profile] + teacher_profiles
            classes = []
            for i, subj in enumerate(subjects):
                teacher = all_teachers[i % len(all_teachers)]
                cls, _ = Class.objects.get_or_create(
                    subject=subj,
                    teacher=teacher,
                    academic_year='2024-25',
                    defaults={'is_active': True}
                )
                classes.append((cls, teacher))
            self.stdout.write(f'    ✓ {len(classes)} classes created')

            # ── Students ──────────────────────────────────────────
            student_profiles = []
            for first, last, roll, sem, batch in dept_data['students']:
                username = f'student_{roll.lower()}'
                s_user, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'email':      f'{username}@sms.com',
                        'first_name': first,
                        'last_name':  last,
                        'role':       'student',
                        'phone':      f'96{roll[-4:]:>08}',
                    }
                )
                if created:
                    s_user.set_password('Student@1234')
                    s_user.save()

                sp, _ = StudentProfile.objects.get_or_create(
                    user=s_user,
                    defaults={
                        'department':  dept,
                        'roll_number': roll,
                        'semester':    sem,
                        'batch_year':  batch,
                    }
                )
                student_profiles.append(sp)
            self.stdout.write(f'    ✓ {len(student_profiles)} students created')

            # ── Enrollments ───────────────────────────────────────
            # Each student enrolls in subjects matching their semester
            enrollment_count = 0
            all_enrollments  = []
            for sp in student_profiles:
                for cls, teacher in classes:
                    if cls.subject.semester == sp.semester:
                        en, created = Enrollment.objects.get_or_create(
                            student=sp,
                            cls=cls
                        )
                        if created:
                            enrollment_count += 1
                        all_enrollments.append((en, teacher))
            self.stdout.write(f'    ✓ {enrollment_count} enrollments created')

            # ── Attendance ────────────────────────────────────────
            att_dates = get_attendance_dates()
            att_count = 0
            for en, teacher in all_enrollments:
                for att_date in att_dates:
                    _, created = AttendanceRecord.objects.get_or_create(
                        enrollment=en,
                        date=att_date,
                        defaults={
                            'status':    random_status(),
                            'marked_by': teacher.user,
                        }
                    )
                    if created:
                        att_count += 1
            self.stdout.write(f'    ✓ {att_count} attendance records created')

            # ── Grades ────────────────────────────────────────────
            exam_types = [
                ('internal1',  50),
                ('internal2',  50),
                ('assignment', 20),
                ('final',     100),
            ]
            grade_count = 0
            for en, teacher in all_enrollments:
                for exam_type, max_marks in exam_types:
                    _, created = Grade.objects.get_or_create(
                        enrollment=en,
                        exam_type=exam_type,
                        defaults={
                            'marks':     round(random.uniform(
                                             max_marks * 0.45,
                                             max_marks
                                         ), 2),
                            'max_marks': max_marks,
                            'remarks':   random.choice([
                                'Good performance',
                                'Needs improvement',
                                'Excellent work',
                                'Satisfactory',
                                'Keep it up',
                                '',
                            ]),
                        }
                    )
                    if created:
                        grade_count += 1
            self.stdout.write(f'    ✓ {grade_count} grade records created')

        # ── Final summary ──────────────────────────────────────────
        self.stdout.write(self.style.SUCCESS(f'''
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Seed complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Users
    Principal  : 1
    HODs       : {User.objects.filter(role="hod").count()}
    Teachers   : {User.objects.filter(role="teacher").count()}
    Students   : {User.objects.filter(role="student").count()}

  Academic data
    Departments: {Department.objects.count()}
    Subjects   : {Subject.objects.count()}
    Classes    : {Class.objects.count()}
    Enrollments: {Enrollment.objects.count()}
    Attendance : {AttendanceRecord.objects.count()}
    Grades     : {Grade.objects.count()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Login credentials (all depts same pattern)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  principal@sms.com        Principal@1234  (Principal)
  hod_cs@sms.com           Hod@1234        (HOD - CS)
  hod_it@sms.com           Hod@1234        (HOD - IT)
  hod_ec@sms.com           Hod@1234        (HOD - EC)
  hod_me@sms.com           Hod@1234        (HOD - ME)
  teacher_cs_1@sms.com     Teacher@1234    (Teacher - CS)
  teacher_it_1@sms.com     Teacher@1234    (Teacher - IT)
  student_cs2022001@sms.com Student@1234   (Student - CS)
  student_it2022001@sms.com Student@1234   (Student - IT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        '''))