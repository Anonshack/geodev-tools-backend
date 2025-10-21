from django.urls import path
from .views import (
    NotificationListCreateView,
    NotificationDetailView,
    NotificationDeleteAPIView
)

urlpatterns = [
    path('', NotificationListCreateView.as_view(), name='notification-list-create'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/<int:pk>/delete/', NotificationDeleteAPIView.as_view(), name='notification-delete'),
]
