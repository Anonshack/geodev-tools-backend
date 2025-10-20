from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.contrib import admin
from django.urls import path, include
from CONF import settings

schema_view = get_schema_view(
   openapi.Info(
      title="API",
      default_version='v1',
      description="Qudratbekh",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="anonshack48@gmail.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('accounts.auth.auth_urls')),
    path('api/v1/users/', include('accounts.urls')),
    path('api/v1/notify/', include('notify.urls')),

   # swagger api
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # auth
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


