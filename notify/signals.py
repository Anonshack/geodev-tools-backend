from django.core.mail import EmailMultiAlternatives
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model, user_logged_out
from django.template.loader import render_to_string

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
