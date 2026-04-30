from django.urls import path
from .views import (
    GenerateMockAPIView,
    MockAPIPublicView,
    MockAPIEndpointView,
    UserMockAPIListView,
    UserMockAPIDetailView,
    RegenerateMockAPIView,
    AdminMockAPIListView,
    AdminMockAPIDetailView,
)

urlpatterns = [
    path("generate/", GenerateMockAPIView.as_view(), name="mock-api-generate"),
    path("mock/<str:slug>/", MockAPIPublicView.as_view(), name="mock-api-public"),
    path("mock/<str:slug>/<str:endpoint>/", MockAPIEndpointView.as_view(), name="mock-api-endpoint"),
    path("my-apis/", UserMockAPIListView.as_view(), name="mock-api-list"),
    path("my-apis/<int:pk>/", UserMockAPIDetailView.as_view(), name="mock-api-detail"),
    path("my-apis/<int:pk>/regenerate/", RegenerateMockAPIView.as_view(), name="mock-api-regenerate"),

    # Admin
    path("admin/", AdminMockAPIListView.as_view(), name="admin-mock-api-list"),
    path("admin/<int:pk>/", AdminMockAPIDetailView.as_view(), name="admin-mock-api-detail"),
]
