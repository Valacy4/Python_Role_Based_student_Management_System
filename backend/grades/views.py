# grades/views.py
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Grade
from .serializers import GradeSerializer
from accounts.permissions import IsTeacher, IsStudent

class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsTeacher()]
        if self.action == 'destroy':
            from accounts.permissions import IsPrincipal
            return [IsPrincipal()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'principal':
            return Grade.objects.all()
        if user.role == 'hod':
            return Grade.objects.filter(
                enrollment__cls__subject__department__hod=user
            )
        if user.role == 'teacher':
            return Grade.objects.filter(
                enrollment__cls__teacher=user.teacher_profile
            )
        if user.role == 'student':
            return Grade.objects.filter(
                enrollment__student=user.student_profile
            )
        return Grade.objects.none()