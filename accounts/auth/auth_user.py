from datetime import datetime
from django.template.loader import render_to_string
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.serializers import UserRegisterSerializer
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
import logging
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from notify.models import Notification
from utils.email_service import send_email_notification

logger = logging.getLogger(__name__)
User = get_user_model()


# Register View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        responses={200: UserRegisterSerializer},
        operation_description="Register part"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


@swagger_auto_schema(
    method='post',
    operation_description="Generate API key part",
    responses={
        200: openapi.Response(
            description="API key generated successfully",
            examples={
                "application/json": {
                    "api_key": "a1b2c3d4e5f6g7h8i9j0"
                }
            }
        )
    }
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_api_key(request):
    user = request.user
    key = user.generate_api_key()
    return Response({'api_key': key}, status=status.HTTP_200_OK)


# Login API
class LoginAPIView(APIView):
    @swagger_auto_schema(
        operation_description="Login part",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, example='user@example.com'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, example='12345SecurePassword'),
            },
        ),
        responses={
            200: openapi.Response(
                description="Login successful",
                examples={
                    "application/json": {
                        "refresh": "eyJ0eXAiOiJKV1QiLCJh...",
                        "access": "eyJhbGciOiJIUzI1NiIs...",
                        "email": "user@example.com",
                        "company_name": "GeoDev LLC",
                        "login_time": "2025-11-01 13:22:11",
                        "ip_address": "127.0.0.1"
                    }
                }
            ),
            401: openapi.Response(description="Invalid credentials"),
            404: openapi.Response(description="User not found"),
        }
    )
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        login_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ip_address = self.get_client_ip(request)

        context = {
            'user': user,
            'login_time': login_time,
            'ip_address': ip_address,
        }

        html_content = render_to_string('emails/login_notification.html', context)
        text_content = (
            f"Hi {user.company_name or user.email}, you have logged in to GeoDev_at company.\n"
            f"Time: {login_time}\nIP: {ip_address}"
        )

        email_message = EmailMultiAlternatives(
            subject='Login Notification',
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email_message.attach_alternative(html_content, "text/html")
        email_message.send()

        return Response({
            "refresh": str(refresh),
            "access": access_token,
            "email": user.email,
            "company_name": user.company_name,
            "login_time": login_time,
            "ip_address": ip_address,
        }, status=status.HTTP_200_OK)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# Logout API
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Logout part",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['refresh'],
            properties={
                'refresh': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    example='eyJ0eXAiOiJKV1QiLCJh...'
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Logout successful",
                examples={
                    "application/json": {"detail": "Logout successful!"}
                }
            ),
            400: openapi.Response(
                description="Invalid or expired token",
                examples={
                    "application/json": {"error": "Token is invalid or expired"}
                }
            ),
        }
    )
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            user = request.user
            Notification.objects.create(
                user=user,
                title="Logged Out",
                message=f"Hi {user.username}, you have successfully logged out.",
                type="system",
            )
            send_email_notification(
                subject="You have logged out",
                template_name="emails/logout_notification.html",
                context={"user": user},
                recipient_list=[user.email],
            )

            return Response({"detail": "Logout successful!"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Logout error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
