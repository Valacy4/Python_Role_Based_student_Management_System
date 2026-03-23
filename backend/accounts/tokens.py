# accounts/tokens.py
from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user):
    """
    Generates access + refresh token for a user.
    We add extra fields (role, name) into the token payload
    so the frontend can read them after decoding.
    """
    refresh = RefreshToken.for_user(user)

    # Add custom claims into the token payload
    refresh['role']       = user.role
    refresh['full_name']  = user.get_full_name()
    refresh['email']      = user.email

    # Access token inherits claims from refresh token
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }