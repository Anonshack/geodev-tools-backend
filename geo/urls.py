from django.urls import path
from .views import (
    SaveUserLocationView,
    UserLocationListView
)

urlpatterns = [
    path("save-location/",
         SaveUserLocationView.as_view(), name="save-location"),
    path("admin-users-locations/",
         UserLocationListView.as_view(), name="locations"),
]
