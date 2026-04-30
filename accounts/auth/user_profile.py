from drf_yasg.utils import swagger_auto_schema
from django.db import models as db_models
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination


class UserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from accounts.serializers import ChangePasswordSerializer, UserSerializer, UserListSerializer, UserAdminSerializer


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="The user can change own password from profile",
        request_body=ChangePasswordSerializer,
        responses={200: ChangePasswordSerializer()}
    )
    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Your password has been changed successfully and sent email."},
            status=status.HTTP_200_OK
        )


class GetAllUsers(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = UserPagination

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                db_models.Q(username__icontains=search) |
                db_models.Q(email__icontains=search) |
                db_models.Q(first_name__icontains=search) |
                db_models.Q(last_name__icontains=search)
            )
        return qs


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def _get_user(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self._get_user(pk)
        if not user:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserAdminSerializer(user).data)

    def patch(self, request, pk):
        user = self._get_user(pk)
        if not user:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if user.is_superuser:
            return Response({"detail": "Cannot modify a superuser."}, status=status.HTTP_403_FORBIDDEN)
        serializer = UserAdminSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserAdminSerializer(user).data)

    def delete(self, request, pk):
        user = self._get_user(pk)
        if not user:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if user.is_superuser:
            return Response({"detail": "Cannot delete a superuser."}, status=status.HTTP_403_FORBIDDEN)
        if user.pk == request.user.pk:
            return Response({"detail": "Cannot delete yourself."}, status=status.HTTP_403_FORBIDDEN)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from storage.models import StoredFile
        from ai_tools.models import MockAPI
        from geo.models import UserLocation
        from notify.models import Notification

        return Response({
            "users":          User.objects.count(),
            "active_users":   User.objects.filter(is_active=True).count(),
            "staff_users":    User.objects.filter(is_staff=True).count(),
            "files":          StoredFile.objects.count(),
            "mock_apis":      MockAPI.objects.count(),
            "active_apis":    MockAPI.objects.filter(is_active=True).count(),
            "locations":      UserLocation.objects.count(),
            "notifications":  Notification.objects.count(),
            "unread_notifs":  Notification.objects.filter(is_read=False).count(),
        })


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
