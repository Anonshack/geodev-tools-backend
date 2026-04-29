from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework import status, permissions
from rest_framework.generics import DestroyAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer, NotificationAdminSerializer


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class NotificationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="List notifications",
        operation_description="Returns paginated notifications for the authenticated user, newest first.",
        manual_parameters=[
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
            openapi.Parameter("page_size", openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
        ],
        responses={200: NotificationSerializer(many=True)},
    )
    def get(self, request):
        qs = (
            Notification.objects.filter(user=request.user)
            .order_by("-created_at")
            .select_related("user")
        )
        unread_count = qs.filter(is_read=False).count()

        paginator = NotificationPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = NotificationSerializer(page, many=True)

        response = paginator.get_paginated_response(serializer.data)
        response.data["unread_count"] = unread_count
        return response

    @swagger_auto_schema(
        operation_summary="Create notification",
        operation_description="Creates a new notification for the authenticated user.",
        request_body=NotificationSerializer,
        responses={201: NotificationSerializer()},
    )
    def post(self, request):
        serializer = NotificationSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get notification detail",
        responses={200: NotificationSerializer()},
    )
    def get(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="Mark notification as read",
        responses={200: openapi.Response(description="Marked as read")},
    )
    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response({"detail": "Notification marked as read"}, status=status.HTTP_200_OK)


class NotificationDeleteAPIView(DestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)

    @swagger_auto_schema(
        operation_summary="Delete a notification",
        responses={204: "Deleted successfully"},
    )
    def delete(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.delete()
        return Response({"detail": "Notification deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Mark all notifications as read",
        responses={200: openapi.Response(description="All notifications marked as read")},
    )
    def post(self, request):
        updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"detail": f"{updated} notification(s) marked as read."}, status=status.HTTP_200_OK)


class NotificationUnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)


# ── Admin views ───────────────────────────────────────────────────────────────

class AdminNotificationListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        qs = Notification.objects.select_related("user").order_by("-created_at")
        paginator = NotificationPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = NotificationAdminSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminNotificationDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk)
        notification.delete()
        return Response({"detail": "Deleted."}, status=status.HTTP_204_NO_CONTENT)


class AdminSendNotificationView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        user_id = request.data.get("user_id")
        title = request.data.get("title", "").strip()
        message = request.data.get("message", "")
        notif_type = request.data.get("type", "system")

        if not title:
            return Response({"detail": "title is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        notification = Notification.objects.create(
            user=user, title=title, message=message, type=notif_type,
        )
        return Response(NotificationAdminSerializer(notification).data, status=status.HTTP_201_CREATED)
