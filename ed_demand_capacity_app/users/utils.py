# From https://medium.com/@dakota.lillie/django-react-jwt-authentication-5015ee00ef9a

from .serializers import UserSerializer


def my_jwt_response_handler(token, user=None, request=None):
    return {
        'token': token,
        'user': UserSerializer(user, context={'request': request}).data
    }