from django.urls import path
from .views import (
    SaveUserLocationView,
    UserOwnLocationsView,
    UserLocationListView,
)

urlpatterns = [
    path("save-location/", SaveUserLocationView.as_view(), name="save-location"),
    path("my-locations/", UserOwnLocationsView.as_view(), name="my-locations"),
    path("admin-users-locations/", UserLocationListView.as_view(), name="admin-locations"),
]
