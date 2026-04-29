import logging
from threading import Thread
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

logger = logging.getLogger(__name__)


def _send(msg):
    try:
        msg.send(fail_silently=False)
        logger.info("Email sent to %s", msg.to)
    except Exception as e:
        logger.exception("Email send failed: %s", e)


def send_email_notification(subject, template_name, context, recipient_list):
    html_content = render_to_string(template_name, context)
    for to_email in recipient_list:
        msg = EmailMultiAlternatives(
            subject=subject,
            body='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.attach_alternative(html_content, "text/html")
        Thread(target=_send, args=(msg,), daemon=True).start()
