from django.urls import path
from accounts.views import (
    GetAllUsers,
    ChangePasswordView,
    ProfileView
)

urlpatterns = [
    path('all-users/', GetAllUsers.as_view(), name='get_all_users'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]
