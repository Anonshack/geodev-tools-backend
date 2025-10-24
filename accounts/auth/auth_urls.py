from django.urls import path
from accounts.auth.password_reset import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordResetCompleteView,
    SetNewPasswordView
)
from accounts.auth.auth_user import (
    RegisterView,
    generate_api_key,
    LoginAPIView,
    LogoutView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path("login/", LoginAPIView.as_view(), name="api-login"),
    path("logout/", LogoutView.as_view(), name="api-logout"),
    path('generate-key/', generate_api_key, name='generate_key'),

    # email orqali parolni reset qilish
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('password-reset/complete/<uidb64>/<token>/', SetNewPasswordView.as_view(), name='password-reset-complete'),
    path('password-reset/complete/', PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
