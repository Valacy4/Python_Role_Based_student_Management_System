from django.db import models
from academics.models import Enrollment

class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ]

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance_records')
    date       = models.DateField()
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES)
    marked_by  = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)

    class Meta:
        unique_together = ('enrollment', 'date')   # one record per student per day per class

    def __str__(self):
        return f"{self.enrollment.student} | {self.date} | {self.status}"