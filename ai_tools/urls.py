from django.urls import path
from .views import (
    GenerateMockAPIView,
    MockAPIPublicView,
    UserMockAPIListView,
    UserMockAPIDetailView,
    RegenerateMockAPIView,
)

urlpatterns = [
    # Create a new mock API
    path("generate/", GenerateMockAPIView.as_view(), name="mock-api-generate"),

    # Public data endpoint — no auth needed
    path("mock/<str:slug>/", MockAPIPublicView.as_view(), name="mock-api-public"),

    # User's own mock APIs
    path("my-apis/", UserMockAPIListView.as_view(), name="mock-api-list"),
    path("my-apis/<int:pk>/", UserMockAPIDetailView.as_view(), name="mock-api-detail"),
    path("my-apis/<int:pk>/regenerate/", RegenerateMockAPIView.as_view(), name="mock-api-regenerate"),
]
