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

# Import Classes
# from .views_shift_types import ShiftTypeClass, create_shift_objects
# from .views_role_types import RoleClass, create_role_objects
from .views_rotas import create_rota_objects

# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO)
# Create the logger
log = logging.getLogger(__name__)




# Inspired by https://www.youtube.com/watch?v=TmsD8QExZ84
class GetAvailableCapacityAsResourcesWeek(APIView):
    def get(self, request, *args, **kwargs):
        user_session = request.session.session_key

        # Get shifts
        role_list, shift_list, rota_entry_list = create_rota_objects(user_session)

        log.info(role_list)
        log.info(shift_list)
        log.info(rota_entry_list)

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)