# academics/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Department, Subject, TeacherProfile, StudentProfile, Class, Enrollment
from .serializers import (DepartmentSerializer, SubjectSerializer,
                           TeacherProfileSerializer, StudentProfileSerializer,
                           ClassSerializer, EnrollmentSerializer)
from accounts.permissions import IsPrincipal, IsHOD, IsTeacher, IsStudent, IsPrincipalOrHOD


class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsPrincipalOrHOD()]
        return [IsPrincipal()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'principal':
            return Department.objects.all()
        if user.role == 'hod':
            return Department.objects.filter(hod=user)
        return Department.objects.none()


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['name', 'code']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsPrincipalOrHOD()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'principal':
            return Subject.objects.all()
        if user.role == 'hod':
            return Subject.objects.filter(department__hod=user)
        if user.role == 'teacher':
            return Subject.objects.filter(
                department=user.teacher_profile.department
            )
        if user.role == 'student':
            return Subject.objects.filter(
                department=user.student_profile.department,
                semester=user.student_profile.semester
            )
        return Subject.objects.none()


class TeacherProfileViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsPrincipalOrHOD()]
        return [IsPrincipal()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'principal':
            return TeacherProfile.objects.all()
        if user.role == 'hod':
            return TeacherProfile.objects.filter(department__hod=user)
        return TeacherProfile.objects.none()


class StudentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StudentProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # ← CHANGED: was IsPrincipalOrHOD — now allows teachers too
            # so ClassDetail page can fetch students to add
            return [IsAuthenticated()]
        if self.action == 'my_profile':
            return [IsAuthenticated()]
        return [IsPrincipal()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'principal':
            return StudentProfile.objects.all()
        if user.role == 'hod':
            return StudentProfile.objects.filter(department__hod=user)
        if user.role == 'teacher':
            # ← ADDED: teacher sees students in their department only
            return StudentProfile.objects.filter(
                department=user.teacher_profile.department
            )
        if user.role == 'student':
            # ← ADDED: student can only see themselves
            return StudentProfile.objects.filter(user=user)
        return StudentProfile.objects.none()

    @action(detail=False, methods=['get'], url_path='my-profile',
            permission_classes=[IsStudent])
    def my_profile(self, request):
        try:
            profile    = StudentProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=404
            )


class ClassViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_classes']:
            return [IsAuthenticated()]
        return [IsPrincipalOrHOD()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'principal':
            return Class.objects.all()
        if user.role == 'hod':
            return Class.objects.filter(
                subject__department__hod=user
            )
        if user.role == 'teacher':
            return Class.objects.filter(
                teacher=user.teacher_profile
            )
        if user.role == 'student':
            return Class.objects.filter(
                enrollments__student=user.student_profile
            )
        return Class.objects.none()

    @action(detail=False, methods=['get'], url_path='my-classes',
            permission_classes=[IsTeacher])
    def my_classes(self, request):
        user = request.user
        try:
            classes    = Class.objects.filter(teacher=user.teacher_profile)
            serializer = self.get_serializer(classes, many=True)
            return Response(serializer.data)
        except Exception:
            return Response(
                {'error': 'No teacher profile found for this user'},
                status=400
            )


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        if self.action == 'destroy':
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'principal':
            return Enrollment.objects.all()
        if user.role == 'hod':
            return Enrollment.objects.filter(
                cls__subject__department__hod=user
            )
        if user.role == 'teacher':
            return Enrollment.objects.filter(
                cls__teacher=user.teacher_profile
            )
        if user.role == 'student':
            return Enrollment.objects.filter(
                student=user.student_profile
            )
        return Enrollment.objects.none()

    def create(self, request, *args, **kwargs):
        user   = request.user
        cls_id = request.data.get('cls')

        if user.role == 'teacher':
            try:
                cls = Class.objects.get(id=cls_id)
            except Class.DoesNotExist:
                return Response(
                    {'error': 'Class not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            if cls.teacher != user.teacher_profile:
                return Response(
                    {'error': 'You can only enroll students into your own classes'},
                    status=status.HTTP_403_FORBIDDEN
                )

        if user.role == 'hod':
            try:
                cls = Class.objects.get(id=cls_id)
            except Class.DoesNotExist:
                return Response(
                    {'error': 'Class not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            if cls.subject.department.hod != user:
                return Response(
                    {'error': 'You can only enroll students into classes within your department'},
                    status=status.HTTP_403_FORBIDDEN
                )

        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        enrollment = self.get_object()
        user       = request.user

        if user.role == 'teacher':
            if enrollment.cls.teacher != user.teacher_profile:
                return Response(
                    {'error': 'You can only remove students from your own classes'},
                    status=status.HTTP_403_FORBIDDEN
                )

        if user.role == 'hod':
            if enrollment.cls.subject.department.hod != user:
                return Response(
                    {'error': 'You can only remove students from classes in your department'},
                    status=status.HTTP_403_FORBIDDEN
                )

        if user.role == 'student':
            return Response(
                {'error': 'Students cannot remove enrollments'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'student':
            serializer.save(student=user.student_profile)
        else:
            serializer.save()
