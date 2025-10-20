import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import notify.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CONF.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            notify.routing.websocket_urlpatterns
        )
    ),
})
