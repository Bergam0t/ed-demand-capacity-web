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

from .views_shift_types import ShiftTypeClass, create_shift_objects
from .views_role_types import RoleClass, create_role_objects

class RotaEntryClass:
    '''
    Object defining a week's worth of rota for a single
    individual
    '''

    def __init__(self,
                 id,
                 role,
                 core=True,
                 name=None,
                 prev_week=None,
                 monday=None,
                 tuesday=None,
                 wednesday=None,
                 thursday=None,
                 friday=None,
                 saturday=None,
                 sunday=None):
        '''
        role: RoleType object
            What role the rota entry relates to. 
            RoleType objects determine decisions per hour.

        core: boolean
            Whether a resource should be considered as core.
            False = resource is ad-hoc.


        name: str
            String giving name of resource e.g. if preferring to 
            work with actual names of individuals

        prev_week: ShiftType object 

        monday: ShiftType object

        tuesday: ShiftType object

        wednesday: ShiftType object

        thursday: ShiftType object

        friday: ShiftType object
        
        saturday: ShiftType object
        
        sunday: ShiftType object
        '''
        self.role = role
        self.core = core
        self.name = name
        self.id = id

        self.prev_week = prev_week
        self.monday = monday
        self.tuesday = tuesday
        self.wednesday = wednesday
        self.thursday = thursday
        self.friday = friday
        self.saturday = saturday
        self.sunday = sunday


def create_rota_objects(user_session):

    role_list = create_role_objects(user_session)
    shift_list = create_shift_objects(user_session)

    queryset = RotaEntry.objects.filter(user_session=user_session)

    def find_role_by_id(id):
        for role_object in role_list:
            if role_object.id == id:
                return role_object
    
    def find_shift_by_id(id):
        for shift_object in shift_list:
            if shift_object.id == id:
                return shift_object


    rota_entry_list = []

    for rota_object in queryset:
        rota_entry_list.append(
            RotaEntryClass(
                role = find_role_by_id(rota_object.role_type),
                core = rota_object.resource_type,
                name = rota_object.resource_name,
                id = rota_object.id,

                prev_week = find_shift_by_id(id),
                monday = find_shift_by_id(id),
                tuesday = find_shift_by_id(id),
                wednesday = find_shift_by_id(id),
                thursday = find_shift_by_id(id),
                friday = find_shift_by_id(id),
                saturday = find_shift_by_id(id),
                sunday = find_shift_by_id(id),
            )
        )

    return role_list, shift_list, rota_entry_list


# Inspired by https://www.youtube.com/watch?v=TmsD8QExZ84

class ViewOwnRotaEntriesDetailed(APIView):
    def get(self, request, *args, **kwargs):
        user_session_key = request.session.session_key
        queryset = RotaEntry.objects.filter(user_session=user_session_key)
        serializer = RotaEntrySerializerView(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class ViewOwnRotaEntries(APIView):
    def get(self, request, *args, **kwargs):
        user_session_key = request.session.session_key
        queryset = RotaEntry.objects.filter(user_session=user_session_key)
        serializer = RotaEntrySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ViewIndividualRotaEntryOwn(APIView):
    def get(self, request, pk, *args, **kwargs):
        # First reduce queryset to only role types owned by the session
        # as don't want users to be able to find other user's role types
        # (or at least not the full details)
        user_session_key = request.session.session_key
        queryset = RotaEntry.objects.filter(user_session=user_session_key)
        single_role = queryset.objects.get(id=pk)
        serializer = RotaEntrySerializerView(single_role, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateRotaEntry(APIView):
    def post(self, request, *args, **kwargs):
        log.info(request.data)
        serializer = RotaEntrySerializer(data=request.data)

        if serializer.is_valid():
            log.info('Serializer valid for submitted role type')
            # Save the role type object, but the user session will be the 
            # default value because we haven't passed that from the frontend
            rota_entry_object = serializer.save()
            
            # Add the user's session to the model object
            user_session_key = request.session.session_key
            rota_entry_object.user_session = user_session_key
            rota_entry_object.save(update_fields=['user_session'])
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            log.error('Serializer not valid for submitted rota entry')
            return Response({'Message': 'Invalid data passed'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteRotaEntry(APIView):
    def post(self, request, pk, *args, **kwargs):
        # First reduce queryset to only role types owned by the session
        # as don't want users to be able to delete other user's role types

        # First reduce queryset to only roles owned by the session
        # as don't want users to be able to find other user's role types
        # (or at least not the full details)
        user_session_key = request.session.session_key
        queryset = RotaEntry.objects.filter(user_session=user_session_key)
        single_rota_entry = queryset.get(id=pk)

        # TODO: Separate these into two different error messages
        if single_rota_entry is None:
            log.error(f'Rota entry {pk} does not exist or does not belong to your session')
            return Response({'Message': 'This role does not exist or does not belong to your session'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        single_rota_entry.delete()

        return Response({'Message': 'Rota entry Deleted'}, status=status.HTTP_200_OK)