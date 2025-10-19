from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
# # utils/email_service.py
# import logging
# from django.core.mail import EmailMultiAlternatives
# from django.template.loader import render_to_string
# from django.conf import settings
# from threading import Thread
#
# logger = logging.getLogger(__name__)
#
# def _send(msg):
#     try:
#         msg.send(fail_silently=False)
#         logger.info("Email sent to %s", msg.to)
#     except Exception as e:
#         logger.exception("Email send failed: %s", e)
#
# def send_html_email(subject, template_name, context, recipient_list, async_send=True, plain_text=None):
#     """
#     recipient_list: list of emails
#     template_name: templates/... path to HTML template
#     async_send: if True send in background thread (prevents blocking)
#     """
#     if not recipient_list:
#         logger.warning("send_html_email called without recipients")
#         return
#
#     html_content = render_to_string(template_name, context)
#     body = plain_text or "Please view this email in an HTML-capable client."
#
#     msg = EmailMultiAlternatives(
#         subject=subject,
#         body=body,
#         from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
#         to=recipient_list,
#     )
#     msg.attach_alternative(html_content, "text/html")
#
#     if async_send:
#         Thread(target=_send, args=(msg,), daemon=True).start()
#     else:
#         _send(msg)


def send_email_notification(subject, template_name, context, recipient_list):
    html_content = render_to_string(template_name, context)
    for to_email in recipient_list:
        email = EmailMultiAlternatives(subject, '', to=[to_email])
        email.attach_alternative(html_content, "text/html")
        email.send()
