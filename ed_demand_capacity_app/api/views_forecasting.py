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

import pandas as pd
import plotly.express as px
from datetime import datetime

# Prophet imports
from prophet import Prophet
from prophet.plot import (plot_plotly, plot_components_plotly, 
                           plot_forecast_component)
from prophet.diagnostics import cross_validation, performance_metrics


# ---- VIEWS ---- #

class ProphetForecastOneWeekMajors(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()
        # with open(historic_data.uploaded_data) as f:
        #     ncols = len(f.readline().split(','))

        imported = pd.read_csv(historic_data.uploaded_data)
        imported['arrival_time'] = pd.to_datetime(imported['arrival_time'])
        grouped = imported.groupby(['date', 'hour', 'stream']).count()[['nhs_number']].reset_index()
        grouped['date_time'] = pd.to_datetime(grouped.date + ':' + grouped.hour.astype('str'), format='%Y-%m-%d:%H')
        grouped = grouped[['date_time', 'stream', 'nhs_number']]

        # At the moment the name is hardcoded - this needs to change to iterate through given streams
        majors = grouped[grouped['stream'] == 'Majors']
        # Get into correct format for Prophet
        majors = majors.drop('stream', axis=1).rename({'date_time': 'ds', 'nhs_number': 'y'}, axis=1)
        # 1 week forecast
        model = Prophet(interval_width=0.95)
        model.add_country_holidays(country_name='England')
        model.fit(majors)
        future = model.make_future_dataframe(periods=24*7, freq='H', include_history=False)
        fcst = model.predict(future)

        fig  = plot_plotly(model, fcst)

        fig = fig.update_layout(xaxis_range=[majors.ds.max().to_pydatetime(), fcst.ds.max()])

        return Response(fig.to_json(), status=status.HTTP_200_OK)