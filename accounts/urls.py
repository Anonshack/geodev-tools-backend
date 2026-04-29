from django.urls import path
from .views import CountryListView
from accounts.auth.user_profile import (
    GetAllUsers,
    ChangePasswordView,
    ProfileView,
    AdminUserDetailView,
    AdminStatsView,
)

urlpatterns = [
    path('all-users/', GetAllUsers.as_view(), name='get_all_users'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('countries/', CountryListView.as_view(), name='countries'),

    # Admin
    path('admin-stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin-users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
