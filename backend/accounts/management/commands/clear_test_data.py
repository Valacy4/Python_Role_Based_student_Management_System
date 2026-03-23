# accounts/management/commands/clear_test_data.py
from django.core.management.base import BaseCommand
from accounts.models import User
from academics.models import Department

class Command(BaseCommand):
    help = 'Removes all test data created by seed_test_data'

    def handle(self, *args, **kwargs):
        test_usernames = [
            'test_hod', 'test_teacher1', 'test_teacher2',
            'test_student1', 'test_student2', 'test_student3',
        ]

        # Deleting users cascades to profiles, enrollments,
        # attendance and grades automatically
        deleted, _ = User.objects.filter(
            username__in=test_usernames
        ).delete()

        # Remove the test department
        Department.objects.filter(
            name='Information Technology'
        ).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f'Removed {deleted} test users and related data.'
            )
        )