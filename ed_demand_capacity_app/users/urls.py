# From https://medium.com/@dakota.lillie/django-react-jwt-authentication-5015ee00ef9a

from django.urls import path
from .views import current_user, UserList

urlpatterns = [
    path('current_user/', current_user),
    path('users/', UserList.as_view())
]