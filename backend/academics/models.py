from django.db import models
from accounts.models import User

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    # A HOD is a User with role='hod'. 
    # null=True because a dept might exist before a HOD is assigned.
    hod  = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='hod_department',
        limit_choices_to={'role': 'hod'}
    )

    def __str__(self):
        return self.name


class TeacherProfile(models.Model):
    """
    Extra info for users who are teachers (including HODs).
    A HOD will have BOTH a TeacherProfile AND be set as dept.hod.
    """
    user           = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    department     = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='teachers')
    employee_id    = models.CharField(max_length=20, unique=True)
    specialization = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Teacher: {self.user.get_full_name()}"


class StudentProfile(models.Model):
    """Extra info for students."""
    SEMESTER_CHOICES = [(i, f"Sem {i}") for i in range(1, 9)]  # Sem 1-8

    user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    department  = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='students')
    roll_number = models.CharField(max_length=20, unique=True)
    semester    = models.IntegerField(choices=SEMESTER_CHOICES)
    batch_year  = models.IntegerField()  # e.g. 2022

    def __str__(self):
        return f"{self.roll_number} - {self.user.get_full_name()}"


class Subject(models.Model):
    name         = models.CharField(max_length=100)
    code         = models.CharField(max_length=20, unique=True)
    department   = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='subjects')
    semester     = models.IntegerField()   # which semester this subject belongs to
    credits      = models.IntegerField(default=3)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Class(models.Model):
    """
    A Class = one Subject being taught by one Teacher in one academic year.
    Example: "CS301 - Data Structures, taught by Mr. Kumar, 2024-25"
    Students enroll INTO a class, not just a subject.
    """
    subject      = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='classes')
    teacher      = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name='classes')
    academic_year = models.CharField(max_length=10)  # e.g. "2024-25"
    is_active    = models.BooleanField(default=True)

    class Meta:
        unique_together = ('subject', 'teacher', 'academic_year')

    def __str__(self):
        return f"{self.subject.code} | {self.teacher.user.get_full_name()} | {self.academic_year}"


class Enrollment(models.Model):
    """Links a student to a class they've chosen."""
    student    = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='enrollments')
    cls        = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'cls')   # can't enroll twice

    def __str__(self):
        return f"{self.student.roll_number} → {self.cls}"