from django.urls import path
from accounts.auth.auth import (
    RegisterView,
    ProfileView,
    generate_api_key
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('generate-key/', generate_api_key, name='generate_key'),
]

