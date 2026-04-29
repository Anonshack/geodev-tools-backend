from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import smart_bytes, smart_str, DjangoUnicodeDecodeError
from django.core.exceptions import ValidationError
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.serializers import PasswordResetRequestSerializer, SetNewPasswordSerializer

User = get_user_model()


class PasswordResetRequestView(APIView):
    permission_classes = []

    @swagger_auto_schema(
        request_body=PasswordResetRequestSerializer,
        responses={200: 'Password reset link sent to your email.'},
        operation_description="Request password reset — sends link to user's email"
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.get(email=email)
        uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
        token = PasswordResetTokenGenerator().make_token(user)

        reset_url = request.build_absolute_uri(
            f"/api/v1/auth/password-reset/confirm/{uidb64}/{token}/"
        )
        email_body = (
            f"Hello {user.username},\n"
            f"Click the link below to reset your password:\n{reset_url}"
        )

        from django.core.mail import EmailMessage
        msg = EmailMessage(
            subject="Reset your password",
            body=email_body,
            to=[user.email],
        )
        from threading import Thread
        Thread(target=lambda: msg.send(fail_silently=True), daemon=True).start()

        return Response({"detail": "Password reset link sent to your email."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Validates the uid+token from the email link (GET). Frontend calls this first."""
    permission_classes = []

    def get(self, request, uidb64, token):
        try:
            uid = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=uid)
        except (DjangoUnicodeDecodeError, User.DoesNotExist, ValueError):
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "message": "Valid token. You can now reset your password.",
            "uidb64": uidb64,
            "token": token,
        }, status=status.HTTP_200_OK)


class PasswordResetCompleteView(APIView):
    """Sets new password. Accepts uidb64+token+passwords in request body."""
    permission_classes = []

    @swagger_auto_schema(
        request_body=SetNewPasswordSerializer,
        responses={200: 'Password has been reset successfully.'},
        operation_description="Set new password using uid and token from reset email"
    )
    def post(self, request):
        serializer = SetNewPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK
        )


class SetNewPasswordView(APIView):
    """Legacy view — uid+token in URL path. Kept for backward compatibility."""
    permission_classes = []

    def post(self, request, uidb64, token):
        try:
            uid = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=uid)
        except (DjangoUnicodeDecodeError, User.DoesNotExist, ValueError):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not new_password or not confirm_password:
            return Response({"error": "Both password fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password reset successful!"}, status=status.HTTP_200_OK)
