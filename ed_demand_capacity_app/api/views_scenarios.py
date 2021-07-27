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


class ViewCreateOrUpdateScenario(APIView):
    def get(self, request, *args, **kwargs):
        user_session_key = request.session.session_key
        # Should only be one scenario object per session, but take
        # last one just in case (also means many=False works, which then means
        # the data is returned to the frontend in the expected format)
        queryset = Scenario.objects.filter(user_session=user_session_key).last()
        serializer = ScenarioSerializer(queryset, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        log.info(request.data)
        serializer = ScenarioSerializer(data=request.data)

        if serializer.is_valid():
            log.info('Serializer valid for submitted scenario')
            # Save the shift type object, but the user session will be the 
            # default value because we haven't passed that from the frontend
            log.info("Checking for existing scenarios")
            user_session_key = request.session.session_key
            queryset = Scenario.objects.filter(user_session=user_session_key)
            if len(queryset) == 0:
                scenario_object = serializer.save()
                
                # Add the user's session to the model object
                
                scenario_object.user_session = user_session_key
                scenario_object.save(update_fields=['user_session'])
            else:
                # Should only be one scenario object per session, but take
                # last one just in case
                scenario_object = queryset.last()
                scenario_object.start_date = request.data['start_date']
                scenario_object.save(update_fields=['start_date'])
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            log.error('Serializer not valid for submitted scenario')
            return Response({'Message': 'Invalid data passed'}, status=status.HTTP_400_BAD_REQUEST)

