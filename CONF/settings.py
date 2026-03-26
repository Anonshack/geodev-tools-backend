import ssl
from datetime import timedelta
from decouple import config, Csv
from pathlib import Path
import certifi
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost', cast=Csv())
SECRET_KEY = config('SECRET_KEY')
...
DJANGO_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'whitenoise.runserver_nostatic',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    "django.contrib.staticfiles",
]

PROJECT_APPS = [
    'drf_yasg',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework.authtoken',
    "corsheaders",
    'rest_framework_simplejwt.token_blacklist',
    'import_export',
]

LOCAL_APPS = [
    'accounts',
    'notify',
    'geo',
    'storage',
    'ai_tools',
]

INSTALLED_APPS = DJANGO_APPS + PROJECT_APPS + LOCAL_APPS

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
ROOT_URLCONF = 'CONF.urls'
WSGI_APPLICATION = 'CONF.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', cast=int),
    }
}
print("DB:", config("DB_NAME"))
print("DB:", config("DB_USER"))
# print("DB:", os.getenv("DB_PASSWORD"))
print("DB:", config("DB_HOST"))
print("DB:", config("DB_PORT"))

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = config("LANGUAGE_CODE", "en-us")
TIME_ZONE = config("TIME_ZONE", "Asia/Tashkent")
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static'
]
STATIC_ROOT = BASE_DIR / 'staticfiles'


MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "rest_framework.schemas.openapi.AutoSchema",
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

EMAIL_BACKEND = config("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = config("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(config("EMAIL_PORT", 587))
EMAIL_USE_TLS = config("EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

ssl._create_default_https_context = ssl._create_unverified_context
SSL_CERT_FILE = certifi.where()

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://geodev-tools-backend.onrender.com",
]

JAZZMIN_SETTINGS = {
    "site_title": "GeoDev Tools Admin",
    "site_header": "GeoDev Tools",
    "site_brand": "GeoDev Admin",

    "site_logo": "img/logo.png",
    "site_logo_classes": "img-circle",

    "login_logo": "img/logo.png",

    "welcome_sign": "Welcome to GeoDev Tools Admin",

    "search_model": ["accounts.User", "notify.Notification", "storage.StoredFile"],

    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index"},
    ],

    "show_sidebar": True,
    "navigation_expanded": True,

    "custom_css": "css/admin_custom.css",
}


JAZZMIN_UI_TWEAKS = {
    "theme": "darkly",
    "navbar": "navbar-light",
    "footer": "footer-light",
}
# Anons / Kudratbekh
