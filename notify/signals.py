from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
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
