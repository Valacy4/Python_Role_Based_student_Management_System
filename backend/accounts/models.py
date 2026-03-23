from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    We extend AbstractUser so we keep all of Django's
    built-in auth (password hashing, login, admin) for free.
    We just add a role field on top.
    """
    class Role(models.TextChoices):
        PRINCIPAL = 'principal', 'Principal'
        HOD       = 'hod',       'HOD'
        TEACHER   = 'teacher',   'Teacher'
        STUDENT   = 'student',   'Student'

    role       = models.CharField(max_length=20, choices=Role.choices)
    phone      = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"