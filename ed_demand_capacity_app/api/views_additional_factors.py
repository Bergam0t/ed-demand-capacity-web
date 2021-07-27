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


# --------------------------- #
# Required Capacity Factors
# --------------------------- #

class CreateRequiredCapacityFactor(APIView):
    def post(self, request, *args, **kwargs):
        log.info(request.data)
        serializer = AdditionalFactorRequiredCapacitySerializer(data=request.data)

        if serializer.is_valid():
            log.info('Serializer valid for submitted capacity factor')
            # Save the shift type object, but the user session will be the 
            # default value because we haven't passed that from the frontend
            capacity_object = serializer.save()
            
            # Add the user's session to the model object
            user_session_key = request.session.session_key
            capacity_object.user_session = user_session_key
            capacity_object.save(update_fields=['user_session'])
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            log.error('Serializer not valid for submitted capacity factor')
            return Response({'Message': 'Invalid data passed'}, status=status.HTTP_400_BAD_REQUEST)


class ViewOwnAdditionalFactorsRequiredCapacity(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = AdditionalFactorRequiredCapacity.objects.filter(user_session=uploader)
        serializer = AdditionalFactorRequiredCapacitySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteAdditionalFactorRequiredCapacity(APIView):
    def post(self, request, pk, *args, **kwargs):
        # First reduce queryset to only factors owned by the session
        # as don't want users to be able to delete other user's  factors
        uploader = request.session.session_key
        queryset = AdditionalFactorRequiredCapacity.objects.filter(user_session=uploader)
        single_factor = queryset.get(id=pk)

        # TODO: Separate these into two different error messages
        if single_factor is None:
            return Response({'Message': 'This capacity factor does not exist or does not belong to your session'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        single_factor.delete()

        return Response({'Message': 'Capacity factor Deleted'}, status=status.HTTP_200_OK)

# --------------------------- # 
# Available Capacity Factors
# --------------------------- # 

class CreateAvailableCapacityFactor(APIView):
    def post(self, request, *args, **kwargs):
        log.info(request.data)
        serializer = AdditionalFactorAvailableCapacitySerializer(data=request.data)

        if serializer.is_valid():
            log.info('Serializer valid for submitted demand factor')
            # Save the shift type object, but the user session will be the 
            # default value because we haven't passed that from the frontend
            demand_object = serializer.save()
            
            # Add the user's session to the model object
            user_session_key = request.session.session_key
            demand_object.user_session = user_session_key
            demand_object.save(update_fields=['user_session'])
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            log.error('Serializer not valid for submitted demand factor')
            return Response({'Message': 'Invalid data passed'}, status=status.HTTP_400_BAD_REQUEST)

class ViewOwnAdditionalFactorsAvailableCapacity(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = AdditionalFactorAvailableCapacity.objects.filter(user_session=uploader)
        serializer = AdditionalFactorAvailableCapacitySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteAdditionalFactorAvailableCapacity(APIView):
    def post(self, request, pk, *args, **kwargs):
        # First reduce queryset to only factors owned by the session
        # as don't want users to be able to delete other user's  factors
        uploader = request.session.session_key
        queryset = AdditionalFactorAvailableCapacity.objects.filter(user_session=uploader)
        single_factor = queryset.get(id=pk)

        # TODO: Separate these into two different error messages
        if single_factor is None:
            return Response({'Message': 'This demand factor does not exist or does not belong to your session'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        single_factor.delete()

        return Response({'Message': 'Demand factor Deleted'}, status=status.HTTP_200_OK)


# ----------------------- # 
# Plotting
# ----------------------- #

