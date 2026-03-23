# accounts/views.py
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import viewsets, filters
from rest_framework.decorators import action

from .tokens import get_tokens_for_user
from .models import User
from .serializers import UserSerializer, UserCreateSerializer
from .permissions import IsPrincipal, IsHOD, IsTeacher, IsStudent


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(username=user_obj.username, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'Account is disabled'},
                status=status.HTTP_403_FORBIDDEN
            )

        tokens = get_tokens_for_user(user)

        return Response({
            'access':    tokens['access'],
            'refresh':   tokens['refresh'],
            'role':      user.role,
            'full_name': user.get_full_name(),
            'email':     user.email,
            'user_id':   user.id,
        }, status=status.HTTP_200_OK)


class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'message': 'Logged out successfully'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class WhoAmIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'user_id':   request.user.id,
            'full_name': request.user.get_full_name(),
            'role':      request.user.role,
            'email':     request.user.email,
            'phone':     request.user.phone,
        })


class PrincipalOnlyView(APIView):
    permission_classes = [IsPrincipal]

    def get(self, request):
        return Response({'message': f'Hello Principal {request.user.get_full_name()}'})


class UserViewSet(viewsets.ModelViewSet):
    queryset           = User.objects.all().order_by('role', 'first_name')
    permission_classes = [IsPrincipal]
    filter_backends    = [filters.SearchFilter]
    search_fields      = ['email', 'first_name', 'last_name', 'role']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'], url_path='by-role/(?P<role>[^/.]+)')
    def by_role(self, request, role=None):
        """GET /api/auth/users/by-role/student/"""
        users = self.queryset.filter(role=role)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], url_path='update-me',
            permission_classes=[IsAuthenticated])
    def update_me(self, request):
        """
        PATCH /api/auth/users/update-me/
        Any logged-in user can update their own safe fields.
        Role, is_staff, is_superuser are blocked.
        """
        user = request.user

        # Whitelist — never allow role or permission fields
        allowed_fields = ['phone', 'first_name', 'last_name']

        data = {
            key: value
            for key, value in request.data.items()
            if key in allowed_fields
        }

        if not data:
            return Response(
                {'error': 'No valid fields. Allowed: phone, first_name, last_name'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'data':    serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)