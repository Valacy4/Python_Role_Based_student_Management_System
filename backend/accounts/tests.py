# accounts/tests.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User


class PermissionTestCase(TestCase):
    """
    Tests that each role can only access what it should.
    Run with: python manage.py test accounts
    """

    def setUp(self):
        """Create one user of each role before every test."""
        self.client = APIClient()

        self.principal = User.objects.create_user(
            username='test_principal', password='Test@1234',
            email='tp@test.com', role='principal'
        )
        self.hod = User.objects.create_user(
            username='test_hod', password='Test@1234',
            email='th@test.com', role='hod'
        )
        self.teacher = User.objects.create_user(
            username='test_teacher', password='Test@1234',
            email='tt@test.com', role='teacher'
        )
        self.student = User.objects.create_user(
            username='test_student', password='Test@1234',
            email='ts@test.com', role='student'
        )

    def get_token(self, email, password):
        """Helper — login and return access token."""
        response = self.client.post('/api/auth/login/', {
            'email':    email,
            'password': password,
        })
        return response.data['access']

    def auth(self, user_email, password='Test@1234'):
        """Helper — set auth header for a user."""
        token = self.get_token(user_email, password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # ── Login tests ──────────────────────────────────────────────────

    def test_login_returns_token_and_role(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'tp@test.com', 'password': 'Test@1234'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access',  response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'principal')

    def test_login_wrong_password_returns_401(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'tp@test.com', 'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, 401)

    def test_login_nonexistent_email_returns_401(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'nobody@test.com', 'password': 'Test@1234'
        })
        self.assertEqual(response.status_code, 401)

    # ── Principal permission tests ────────────────────────────────────

    def test_principal_can_access_users_list(self):
        self.auth('tp@test.com')
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, 200)

    def test_principal_can_access_principal_only_endpoint(self):
        self.auth('tp@test.com')
        response = self.client.get('/api/auth/principal-only/')
        self.assertEqual(response.status_code, 200)

    # ── HOD permission tests ──────────────────────────────────────────

    def test_hod_cannot_access_users_list(self):
        self.auth('th@test.com')
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, 403)

    def test_hod_cannot_access_principal_only_endpoint(self):
        self.auth('th@test.com')
        response = self.client.get('/api/auth/principal-only/')
        self.assertEqual(response.status_code, 403)

    # ── Teacher permission tests ──────────────────────────────────────

    def test_teacher_cannot_access_users_list(self):
        self.auth('tt@test.com')
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, 403)

    def test_teacher_can_access_whoami(self):
        self.auth('tt@test.com')
        response = self.client.get('/api/auth/whoami/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['role'], 'teacher')

    # ── Student permission tests ──────────────────────────────────────

    def test_student_cannot_access_users_list(self):
        self.auth('ts@test.com')
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, 403)

    def test_student_cannot_access_principal_only(self):
        self.auth('ts@test.com')
        response = self.client.get('/api/auth/principal-only/')
        self.assertEqual(response.status_code, 403)

    def test_student_can_access_whoami(self):
        self.auth('ts@test.com')
        response = self.client.get('/api/auth/whoami/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['role'], 'student')

    # ── Unauthenticated tests ─────────────────────────────────────────

    def test_unauthenticated_cannot_access_whoami(self):
        # No auth header
        response = self.client.get('/api/auth/whoami/')
        self.assertEqual(response.status_code, 401)

    def test_unauthenticated_cannot_access_users(self):
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, 401)

    # ── update-me tests ───────────────────────────────────────────────

    def test_student_can_update_own_phone(self):
        self.auth('ts@test.com')
        response = self.client.patch('/api/auth/users/update-me/', {
            'phone': '9876543210'
        })
        self.assertEqual(response.status_code, 200)
        self.student.refresh_from_db()
        self.assertEqual(self.student.phone, '9876543210')

    def test_student_cannot_change_own_role(self):
        self.auth('ts@test.com')
        response = self.client.patch('/api/auth/users/update-me/', {
            'role': 'principal'   # should be blocked
        })
        # Either 400 (no valid fields) or 200 but role unchanged
        self.student.refresh_from_db()
        self.assertEqual(self.student.role, 'student')