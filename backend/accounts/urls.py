# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (LoginView, RefreshTokenView, LogoutView,
                    WhoAmIView, PrincipalOnlyView, UserViewSet)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('login/',          LoginView.as_view(),         name='login'),
    path('refresh/',        RefreshTokenView.as_view(),  name='refresh'),
    path('logout/',         LogoutView.as_view(),        name='logout'),
    path('whoami/',         WhoAmIView.as_view(),        name='whoami'),
    path('principal-only/', PrincipalOnlyView.as_view(), name='principal-only'),
    path('',                include(router.urls)),
]