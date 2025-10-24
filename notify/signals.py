from django.core.mail import EmailMultiAlternatives, send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model, user_logged_out
from django.template.loader import render_to_string

from CONF import settings
from .models import Notification

User = get_user_model()

@receiver(post_save, sender=User)
def create_welcome_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance,
            title=f"Welcome to GeoDev_at",
            message=f"Hi, {instance.username}, welcome to our platform."
        )

@receiver(post_save, sender=User)
def password_changed_notification(sender, instance, created, **kwargs):
    if not created:
        if getattr(instance, "_password_changed", False):
            Notification.objects.create(
                user=instance,
                title="🔒 Password Updated",
                message="Your password was successfully changed.",
                type="system"
            )

@receiver(user_logged_out)
def send_logout_email(sender, request, user, **kwargs):
    if user and user.email:
        subject = "You have logged out"
        html_content = render_to_string("emails/logout_notification.html", {"user": user})
        msg = EmailMultiAlternatives(subject, "", "noreply@geodev.com", [user.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()

@receiver(post_save, sender=User)
def send_password_reset_notification(sender, instance, created, **kwargs):
    if not created and instance.password:
        send_mail(
            subject='🔐 Your password has been changed',
            message=(
                f"Hello {instance.username},\n\n"
                "Your password was successfully changed. "
                "If you did not make this change, please contact support immediately."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
            fail_silently=True,
        )