# accounts/management/commands/clear_batch_test.py
from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Removes all test batch students created by seed_batch_test'

    def handle(self, *args, **kwargs):
        deleted, _ = User.objects.filter(
            username__startswith='test_batch_'
        ).delete()

        self.stdout.write(self.style.SUCCESS(
            f'Removed {deleted} test batch records (users + profiles + enrollments).'
        ))