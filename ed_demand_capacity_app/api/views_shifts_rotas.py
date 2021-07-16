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
from rest_pandas import PandasSimpleView
import pandas as pd
import plotly.express as px
from datetime import datetime
from rest_framework.authtoken.models import Token

# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO)
# Create the logger
log = logging.getLogger(__name__)

# Inspired by https://www.youtube.com/watch?v=TmsD8QExZ84

class ViewAllShiftTypesAnonymous(APIView):
    '''
    View for seeing shift types across organisations
    *TODO* Add in an anonymous organisation ID?  
    '''
    def get(self, request, *args, **kwargs):
        shifts = Shift.objects.all()
        serializer = ShiftSerializerAnonymised(shifts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ViewOwnShiftTypes(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = Shift.objects.filter(user_session=uploader)
        serializer = ShiftSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ViewIndividualShiftOwn(APIView):
    def get(self, request, pk, *args, **kwargs):
        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to find other user's shift types
        # (or at least not the full details)
        uploader = request.session.session_key
        queryset = Shift.objects.filter(user_session=uploader)
        single_shift = queryset.objects.get(id=pk)
        serializer = ShiftSerializer(single_shift, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ViewIndividualShiftAnyAnonymous(APIView):
    def get(self, request, pk, *args, **kwargs):
        shift = Shift.objects.get(id=pk)
        serializer = ShiftSerializerAnonymised(shift, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CreateShiftType(APIView):
    def post(self, request, *args, **kwargs):
        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to find other user's shift types
        # (or at least not the full details)
        log.info(request.data)
        serializer = ShiftSerializer(data=request.data)

        if serializer.is_valid():
            log.info('Serializer valid for submitted shift type')
            # Save the shift type object, but the user session will be the 
            # default value because we haven't passed that from the frontend
            shift_object = serializer.save()
            
            # Add the user's session to the model object
            user_session_key = request.session.session_key
            shift_object.user_session = user_session_key
            shift_object.save(update_fields=['user_session'])
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            log.error('Serializer not valid for submitted shift type')
            return Response({'Message': 'Invalid data passed'}, status=status.HTTP_400_BAD_REQUEST)

class UpdateShiftType(APIView):
    def post(self, request, pk, *args, **kwargs):
        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to update other user's shift types

        uploader = request.session.session_key
        queryset = Shift.objects.filter(user_session=uploader)
        single_shift = queryset.objects.get(id=pk)

        # TODO: Separate these into two different error messages
        if len(single_shift < 1):
            return Response({'Message': 'This shift does not exist or does not belong to your session'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = ShiftSerializer(instance=single_shift, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'Message': 'Invalid data passed'}, status=status.HTTP_400_BAD_REQUEST)

class DeleteShiftType(APIView):
    def post(self, request, pk, *args, **kwargs):
        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to delete other user's shift types

        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to find other user's shift types
        # (or at least not the full details)
        uploader = request.session.session_key
        queryset = Shift.objects.filter(user_session=uploader)
        single_shift = queryset.objects.get(id=pk)

        # TODO: Separate these into two different error messages
        if len(single_shift < 1):
            return Response({'Message': 'This shift does not exist or does not belong to your session'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        single_shift.delete()

        return Response({'Message': 'Shift Deleted'}, status=status.HTTP_200_OK)
