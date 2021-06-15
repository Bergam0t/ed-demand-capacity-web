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


# ---- VIEWS ---- #