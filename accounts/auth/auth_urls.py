from django.urls import path
from accounts.auth.auth_user import (
    RegisterView,
    generate_api_key,
    LoginAPIView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path("login/", LoginAPIView.as_view(), name="api-login"),
    path('generate-key/', generate_api_key, name='generate_key'),
]
