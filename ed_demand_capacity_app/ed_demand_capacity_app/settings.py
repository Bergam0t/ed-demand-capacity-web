"""
Django settings for ed_demand_capacity_app project.

Generated by 'django-admin startproject' using Django 3.2.1.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

from pathlib import Path
import os
from datetime import timedelta
import django_heroku
import dj_database_url
import psycopg2
from dotenv import load_dotenv, find_dotenv

env_path=find_dotenv()

print(f".env path: {env_path}")

if os.path.exists(env_path):
    load_dotenv(env_path)


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['0.0.0.0', 
                 'localhost', 
                 '127.0.0.1', 
                 'https://ed-demand-capacity-api.herokuapp.com/']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'api.apps.ApiConfig',
    'rest_framework',
    'users.apps.UsersConfig',
    'frontend.apps.FrontendConfig',
    'corsheaders',
    'background_task',
    'whitenoise.runserver_nostatic'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    # 'ed_demand_capacity_app.middleware.auth_user_jwt_middleware.AuthenticationMiddlewareJWT',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware'
]

# This setting is crucial for allowing the login flow to work
# If you remove this, you won't redirect after clicking 'login' and the 
# login isn't successful
CORS_ORIGIN_ALLOW_ALL = True

# See https://stackoverflow.com/questions/57305141/react-django-rest-framework-session-is-not-persisting-working
# CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'ed_demand_capacity_app.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ed_demand_capacity_app.wsgi.application'

# Set max attempts for background tasks
MAX_ATTEMPTS = 3

# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

# Old database
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # 'NAME':'redb',
        # 'USER': 'postgres',
        # 'PASSWORD':'admin',
        # 'HOST': 'localhost'
    }
}

# Comment out the next line if running on Heroku
# I have no idea why this can't be successfully retrieved from
# the env file when the AWS ones are retrieved successfully!
# And it does get retrieved - just seemingly not recognised.
# os.environ['DATABASE_URL'] = "postgres://ozdqiskfjtelee:9cffeb67f7e9331ed83c5c04eb26a327b0bc6ab1e8a6768ee1a3fa164678d740@ec2-54-220-35-19.eu-west-1.compute.amazonaws.com:5432/dokmln8i3j7lk"

DATABASE_URL = os.environ.get('DATABASE_URL')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')


db_from_env = dj_database_url.config(conn_max_age=600)
DATABASES['default'].update(db_from_env)

# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATIC_URL = '/static/'

STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'

# location where you will store your static files
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'ed_demand_capacity_app/static')
]

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Specify custom user model
AUTH_USER_MODEL = 'users.CustomUser'


# -------------------------- #
# Storage of file uploads
# -------------------------- #

# Following s3 storage instructions from here: 
# https://blog.theodo.com/2019/07/aws-s3-upload-django/

# MEDIA_ROOT = os.path.join(BASE_DIR, 'uploads')
MEDIA_URL = '/uploads/'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_STORAGE_BUCKET_NAME = 'ed-demand-capacity-storage'
AWS_S3_REGION_NAME = 'eu-west-2'

# ------------------------------------- #
# REST Framework settings and auth
# ------------------------------------- #

# Added to deal with authentication
# See https://medium.com/@dakota.lillie/django-react-jwt-authentication-5015ee00ef9a
# Also https://www.jetbrains.com/pycharm/guide/tutorials/django-aws/rest-api-jwt/
# "If no class authenticates, 
# request.user will be set to an instance of AnonymousUser, 
# and request.auth will be set to None."
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 5,
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
        # 'rest_framework.permissions.IsAuthenticated',
        # 'rest_framework.permissions.IsAdminUser'
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',),
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.NamespaceVersioning',
}

# From https://medium.com/@dakota.lillie/django-react-jwt-authentication-5015ee00ef9a
# JWT_AUTH = {
#     'JWT_RESPONSE_PAYLOAD_HANDLER': 'users.utils.my_jwt_response_handler'
# }

# --------------------------- #
# Sessions
# --------------------------- #

SESSION_ENGINE = "django.contrib.sessions.backends.db"


# ---------------------------- #
# Auth with jwt
# ---------------------------- #

# JWT_PAYLOAD_GET_USER_ID_HANDLER: 'rest_framework_jwt.utils.jwt_get_user_id_from_payload_handler'

## I'm not sure how many of these settings are actually needed!

SIMPLE_JWT = {
    # 'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'ACCESS_TOKEN_LIFETIME': timedelta(days=365),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# ----------------------- #
# Heroku settings
# ----------------------- #

# Activate Django-Heroku.
django_heroku.settings(locals())