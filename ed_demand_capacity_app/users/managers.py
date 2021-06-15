# Code taken from https://testdriven.io/blog/django-custom-user-model/

from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import ugettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_dc_admin(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_organisation_admin', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)

        return self.create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_organisation_admin', False)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)

    def create_org_admin(self, email, password, **extra_fields):
        """
        Create and save a Organisation Admin with the given email and password.
        """
        extra_fields.setdefault('is_organisation_admin', True)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_organisation_admin') is not True:
            raise ValueError(_('Organisation admin must have is_organisation_admin=True.'))
        return self.create_user(email, password, **extra_fields)