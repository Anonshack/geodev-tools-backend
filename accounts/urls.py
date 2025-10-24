from django.urls import path
from .views import CountryListView
from accounts.auth.user_profile import (
    GetAllUsers,
    ChangePasswordView,
    ProfileView,
)

urlpatterns = [
    path('all-users/', GetAllUsers.as_view(), name='get_all_users'),
    path('profile/', ProfileView.as_view(), name='profile'),
    # profile dan turib passwordni change qilish
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('countries/', CountryListView.as_view(), name='countries'),
]
