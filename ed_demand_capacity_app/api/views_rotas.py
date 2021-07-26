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