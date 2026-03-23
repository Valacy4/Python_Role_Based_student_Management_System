# academics/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (DepartmentViewSet, SubjectViewSet, TeacherProfileViewSet,
                    StudentProfileViewSet, ClassViewSet, EnrollmentViewSet)

router = DefaultRouter()
router.register(r'departments',  DepartmentViewSet,      basename='department')
router.register(r'subjects',     SubjectViewSet,         basename='subject')
router.register(r'teachers',     TeacherProfileViewSet,  basename='teacher')
router.register(r'students',     StudentProfileViewSet,  basename='student')
router.register(r'classes',      ClassViewSet,           basename='class')
router.register(r'enrollments',  EnrollmentViewSet,      basename='enrollment')

urlpatterns = [path('', include(router.urls))]