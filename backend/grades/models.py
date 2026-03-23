from django.db import models
from academics.models import Enrollment

class Grade(models.Model):
    EXAM_TYPES = [
        ('internal1', 'Internal 1'),
        ('internal2', 'Internal 2'),
        ('assignment', 'Assignment'),
        ('final', 'Final Exam'),
    ]

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='grades')
    exam_type  = models.CharField(max_length=20, choices=EXAM_TYPES)
    marks      = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks  = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    remarks    = models.TextField(blank=True)
    graded_at  = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('enrollment', 'exam_type')

    def __str__(self):
        return f"{self.enrollment.student} | {self.exam_type} | {self.marks}/{self.max_marks}"