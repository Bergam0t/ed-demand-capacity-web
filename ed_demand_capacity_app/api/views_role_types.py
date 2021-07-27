from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from .models import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
import logging
import pandas as pd
from datetime import datetime, timedelta
from rest_framework.authtoken.models import Token
import plotly.graph_objects as go
from dateutil import parser


# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO)
# Create the logger
log = logging.getLogger(__name__)


class RoleClass:
    def __init__(self,
                role_name,
                id,
                decisions_per_hour_per_stream):

        '''
        The role defines the decision-making capabilities of a 
        particular class of decision maker

        e.g. a Role could be 'Consultant majors'

        You may have >1 individual with the same role in an ED
        

        Params:
        -------

        role_name: str
            Name of role
            Examples: Cons Resus, Cons Majors, Cons Minors

        decisions_per_hour_per_stream: list of dicts
            List of dicts in the following format
            {'stream': str, 'decisions_per_hour': float}
            Where stream is the stream name
            Decisions per hour is 

            If a resource is able to make decisions for multiple streams,
            then the list should contain multiple dictionaries

        '''
    
        self.role_name = role_name
        self.id = id
        self.decisions_per_hour_per_stream = decisions_per_hour_per_stream 


def create_role_objects(user_session):
    queryset = Role.objects.filter(user_session=user_session)

    role_list = []

    for role_object in queryset:
        role_list.append(
            RoleClass(
                role_name = role_object.role_name,
                id = role_object.id,
                decisions_per_hour_per_stream = role_object.decisions_per_hour_per_stream
            )
        )

    return role_list

# Inspired by https://www.youtube.com/watch?v=TmsD8QExZ84

class ViewOwnRoleTypes(APIView):
    def get(self, request, *args, **kwargs):
        user_session_key = request.session.session_key
        queryset = Role.objects.filter(user_session=user_session_key)
        serializer = RoleSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ViewIndividualRoleOwn(APIView):
    def get(self, request, pk, *args, **kwargs):
        # First reduce queryset to only role types owned by the session
        # as don't want users to be able to find other user's role types
        # (or at least not the full details)
        user_session_key = request.session.session_key
        queryset = Role.objects.filter(user_session=user_session_key)
        single_role = queryset.objects.get(id=pk)
        serializer = RoleSerializer(single_role, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateRoleType(APIView):
    def post(self, request, *args, **kwargs):
        log.info(request.data)
        serializer = RoleSerializer(data=request.data)

        if serializer.is_valid():
            log.info('Serializer valid for submitted role type')
            # Save the role type object, but the user session will be the 
            # default value because we haven't passed that from the frontend
            role_object = serializer.save()
            
            # Add the user's session to the model object
            user_session_key = request.session.session_key
            role_object.user_session = user_session_key
            role_object.save(update_fields=['user_session'])
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            log.error('Serializer not valid for submitted role type')
            return Response({'Message': 'Invalid data passed'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteRoleType(APIView):
    def post(self, request, pk, *args, **kwargs):
        # First reduce queryset to only role types owned by the session
        # as don't want users to be able to delete other user's role types

        # First reduce queryset to only roles owned by the session
        # as don't want users to be able to find other user's role types
        # (or at least not the full details)
        user_session_key = request.session.session_key
        queryset = Role.objects.filter(user_session=user_session_key)
        single_role = queryset.get(id=pk)

        # TODO: Separate these into two different error messages
        if single_role is None:
            log.error(f'Role {pk} does not exist or does not belong to your session')
            return Response({'Message': 'This role does not exist or does not belong to your session'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        single_role.delete()

        return Response({'Message': 'Role Deleted'}, status=status.HTTP_200_OK)