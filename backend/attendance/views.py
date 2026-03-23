# attendance/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import AttendanceRecord
from .serializers import AttendanceSerializer
from accounts.permissions import IsTeacher, IsStudent

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['enrollment__student__roll_number', 'date', 'status']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsTeacher()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'principal':
            return AttendanceRecord.objects.all()
        if user.role == 'hod':
            return AttendanceRecord.objects.filter(
                enrollment__cls__subject__department__hod=user
            )
        if user.role in ['teacher']:
            # Teacher sees attendance only for their classes
            return AttendanceRecord.objects.filter(
                enrollment__cls__teacher=user.teacher_profile
            )
        if user.role == 'student':
            # Student sees only their own attendance
            return AttendanceRecord.objects.filter(
                enrollment__student=user.student_profile
            )
        return AttendanceRecord.objects.none()

    def perform_create(self, serializer):
        # Auto-fill who marked the attendance
        serializer.save(marked_by=self.request.user)