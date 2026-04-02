# accounts/management/commands/seed_batch_test.py
from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from academics.models import StudentProfile, Department


class Command(BaseCommand):
    help = 'Seeds test batch students for testing batch delete feature'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('Creating batch test students...\n')

        # Get existing departments — won't create new ones
        try:
            dept_cs = Department.objects.get(name='Computer Science')
            dept_it = Department.objects.get(name='Information Technology')
            dept_ec = Department.objects.get(name='Electronics Engineering')
        except Department.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(
                f'Department not found: {e}. Run seed_full_data first.'
            ))
            return

        # All test students — prefixed with TEST_ so easy to identify
        # Roll numbers use TEST prefix so they never clash with real data
        test_students = [
            # CS — Batch 2020
            ('TEST_Arjun',   'Bose',    'TEST_CS2020001', 1, 2020, dept_cs),
            ('TEST_Meena',   'Reddy',   'TEST_CS2020002', 1, 2020, dept_cs),
            ('TEST_Sunil',   'Joshi',   'TEST_CS2020003', 2, 2020, dept_cs),
            ('TEST_Pooja',   'Agarwal', 'TEST_CS2020004', 2, 2020, dept_cs),
            ('TEST_Vikram',  'Rao',     'TEST_CS2020005', 2, 2020, dept_cs),

            # CS — Batch 2021
            ('TEST_Riya',    'Kapoor',  'TEST_CS2021001', 3, 2021, dept_cs),
            ('TEST_Sanjay',  'Dubey',   'TEST_CS2021002', 3, 2021, dept_cs),
            ('TEST_Nandini', 'Sharma',  'TEST_CS2021003', 4, 2021, dept_cs),
            ('TEST_Rohit',   'Mishra',  'TEST_CS2021004', 4, 2021, dept_cs),
            ('TEST_Priya',   'Pandey',  'TEST_CS2021005', 4, 2021, dept_cs),

            # IT — Batch 2020
            ('TEST_Amar',    'Singh',   'TEST_IT2020001', 1, 2020, dept_it),
            ('TEST_Shalini', 'Tiwari',  'TEST_IT2020002', 2, 2020, dept_it),
            ('TEST_Gaurav',  'Yadav',   'TEST_IT2020003', 2, 2020, dept_it),

            # IT — Batch 2021
            ('TEST_Kavya',   'Menon',   'TEST_IT2021001', 3, 2021, dept_it),
            ('TEST_Ajay',    'Nair',    'TEST_IT2021002', 4, 2021, dept_it),

            # EC — Batch 2020
            ('TEST_Divya',   'Pillai',  'TEST_EC2020001', 1, 2020, dept_ec),
            ('TEST_Rahul',   'Thomas',  'TEST_EC2020002', 2, 2020, dept_ec),
            ('TEST_Sneha',   'Kumar',   'TEST_EC2020003', 2, 2020, dept_ec),
        ]

        created = 0
        skipped = 0

        for first, last, roll, sem, batch_year, dept in test_students:
            username = f'test_batch_{roll.lower()}'
            email    = f'{username}@sms.com'

            u, new = User.objects.get_or_create(
                username=username,
                defaults={
                    'email':      email,
                    'first_name': first,
                    'last_name':  last,
                    'role':       'student',
                    'phone':      '9000000000',
                    'is_active':  True,
                }
            )
            if new:
                u.set_password('Test@1234')
                u.save()

            _, profile_new = StudentProfile.objects.get_or_create(
                user=u,
                defaults={
                    'department':  dept,
                    'roll_number': roll,
                    'semester':    sem,
                    'batch_year':  batch_year,
                }
            )

            if new and profile_new:
                created += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(f'''
Batch test data ready!
─────────────────────────────────────────────────────
Created : {created} students
Skipped : {skipped} (already existed)
─────────────────────────────────────────────────────
Department       Batch   Semester   Count
─────────────────────────────────────────────────────
Computer Science  2020    Sem 1-2    5 students
Computer Science  2021    Sem 3-4    5 students
Info Technology   2020    Sem 1-2    3 students
Info Technology   2021    Sem 3-4    2 students
Electronics       2020    Sem 1-2    3 students
─────────────────────────────────────────────────────
All usernames start with: test_batch_
All roll numbers start with: TEST_
Password for all: Test@1234
─────────────────────────────────────────────────────
Test scenarios to try:
  Filter Batch 2020           → shows 11 students
  Filter CS + Batch 2020      → shows 5 students
  Filter CS + Batch 2021      → shows 5 students
  Filter IT + Batch 2020      → shows 3 students
  Filter EC + Batch 2020      → shows 3 students
  Filter CS + Sem 3           → shows 2 students
        '''))