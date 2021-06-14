# From https://medium.com/@dakota.lillie/django-react-jwt-authentication-5015ee00ef9a

from django.shortcuts import render

# Create your views here.
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from rest_framework import permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, UserSerializerWithToken
import logging
from django.http import JsonResponse

from django.contrib.auth import get_user_model
User = get_user_model()


# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO)
# Create the logger
log = logging.getLogger(__name__)

@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
    """
    log.info(request.user)
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class GetCurrentUser(APIView):
    def get(self, request):
        log.info(self.request.user)
        serializer = UserSerializer(data=self.request.user)
        if serializer.is_valid():
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserList(APIView):
    """
    Create a new user. It's called 'UserList' because normally we'd have a get
    method here too, for retrieving a list of all User objects.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ViewUserList(APIView):
    # permission_classes = (permissions.IsAdminUser,)
    # permission_classes = (permissions.AllowAny,)
    permission_classes = [permissions.IsAuthenticated,]

    # permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        queryset = User.objects.all()
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)