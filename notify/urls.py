from django.urls import path
from .views import (
    NotificationListCreateView,
    NotificationDetailView,
    NotificationDeleteAPIView,
    NotificationMarkAllReadView,
    NotificationUnreadCountView,
    AdminNotificationListView,
    AdminNotificationDeleteView,
    AdminSendNotificationView,
)

urlpatterns = [
    path('', NotificationListCreateView.as_view(), name='notification-list-create'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('<int:pk>/delete/', NotificationDeleteAPIView.as_view(), name='notification-delete'),
    path('mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('unread-count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),

    # Admin
    path('admin/', AdminNotificationListView.as_view(), name='admin-notification-list'),
    path('admin/<int:pk>/delete/', AdminNotificationDeleteView.as_view(), name='admin-notification-delete'),
    path('admin/send/', AdminSendNotificationView.as_view(), name='admin-notification-send'),
]
