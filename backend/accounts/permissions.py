# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsPrincipal(BasePermission):
    """Only principals can access this endpoint."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'principal'
        )

class IsHOD(BasePermission):
    """Only HODs can access this endpoint."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'hod'
        )

class IsTeacher(BasePermission):
    """Teachers AND HODs can access this (HOD also teaches)."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['teacher', 'hod']
        )

class IsStudent(BasePermission):
    """Only students can access this endpoint."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'student'
        )

class IsPrincipalOrHOD(BasePermission):
    """Principal or HOD — for shared management views."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['principal', 'hod']
        )