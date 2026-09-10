"""
Django settings for jarvis_backend project.
J.A.R.V.I.S: Just A Rather Very Intelligent System
"""

import os
from pathlib import Path

from dotenv import load_dotenv


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

# Load .env locally if it exists
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")


# ============================================================
# SECURITY
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-change-this-in-production"
)

DEBUG = os.getenv("DEBUG", "False").lower() == "true"


# ============================================================
# ALLOWED HOSTS
# ============================================================

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    ".onrender.com",
]


# If you want to specify your Render domain manually:
#
# ALLOWED_HOSTS = [
#     "your-project.onrender.com",
#     "localhost",
#     "127.0.0.1",
# ]


# ============================================================
# APPLICATIONS
# ============================================================

INSTALLED_APPS = [

    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",

    # Your applications
    "assistant.apps.AssistantConfig",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [

    # CORS
    "corsheaders.middleware.CorsMiddleware",

    # Security
    "django.middleware.security.SecurityMiddleware",

    # WhiteNoise for static files
    "whitenoise.middleware.WhiteNoiseMiddleware",

    # Django
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URL CONFIGURATION
# ============================================================

ROOT_URLCONF = "jarvis_backend.urls"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [
            BASE_DIR.parent / "frontend",
        ],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ============================================================
# WSGI / ASGI
# ============================================================

WSGI_APPLICATION = "jarvis_backend.wsgi.application"

ASGI_APPLICATION = "jarvis_backend.asgi.application"


# ============================================================
# DATABASE
# ============================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ============================================================
# PASSWORD VALIDATION
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME":
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator",
    },
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_DIRS = [
    BASE_DIR.parent / "frontend",
]


# WhiteNoise static file configuration
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },

    "staticfiles": {
        "BACKEND":
            "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}


# ============================================================
# MEDIA FILES
# ============================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# DEFAULT PRIMARY KEY
# ============================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ============================================================
# DJANGO REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {

    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],

    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
}


# ============================================================
# CORS
# ============================================================

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",

    "http://localhost:8000",
    "http://127.0.0.1:8000",

    "http://localhost:3000",
    "http://127.0.0.1:3000",

    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


# Add production frontend URL through Render environment variable
cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")

if cors_origins:
    CORS_ALLOWED_ORIGINS.extend(
        [
            origin.strip()
            for origin in cors_origins.split(",")
            if origin.strip()
        ]
    )


# ============================================================
# CSRF
# ============================================================

CSRF_TRUSTED_ORIGINS = []

csrf_origins = os.getenv("CSRF_TRUSTED_ORIGINS", "")

if csrf_origins:
    CSRF_TRUSTED_ORIGINS = [
        origin.strip()
        for origin in csrf_origins.split(",")
        if origin.strip()
    ]


# ============================================================
# GROQ AI / JARVIS
# ============================================================

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY",
    ""
).strip()


GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.1-8b-instant"
).strip()


JARVIS_SYSTEM_PROMPT = (
    "You are JARVIS (Just A Rather Very Intelligent System), "
    "an intelligent virtual assistant inspired by Tony Stark's "
    "sophisticated AI system. You are polite, witty, concise, "
    "professional, and exceptionally helpful. Address the user "
    "as 'Sir' (or 'Ma'am' if indicated). Provide clear, direct, "
    "and intelligent answers. Do not claim to directly operate "
    "physical actuators unless an integrated command is invoked. "
    "Keep responses focused and avoid unnecessary verbosity, "
    "speaking in a crisp, refined tone."
)


# ============================================================
# PRODUCTION SECURITY
# ============================================================

if not DEBUG:

    SECURE_BROWSER_XSS_FILTER = True

    SECURE_CONTENT_TYPE_NOSNIFF = True

    X_FRAME_OPTIONS = "DENY"

    SECURE_REFERRER_POLICY = "same-origin"

    SESSION_COOKIE_SECURE = True

    CSRF_COOKIE_SECURE = True
