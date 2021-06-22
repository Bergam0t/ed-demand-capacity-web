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

        # Convert the uploaded csv to a pandas dataframe
        historic_df = pd.read_csv(historic_data.uploaded_data)
        historic_df['datetime'] = pd.to_datetime(historic_df['datetime'])
        historic_df['date'] = historic_df['datetime'].dt.date
        historic_df['hour'] = historic_df['datetime'].dt.hour
        historic_df['dummy'] = 1
        
        grouped = historic_df.groupby(['date', 'hour', 'stream']).count()[['dummy']].reset_index()
        
        
        grouped['date_time_hour_start'] = (
            pd.to_datetime(grouped.date.astype('str') 
                           + ':' 
                           + grouped.hour.astype('str'), 
                           format='%Y-%m-%d:%H')
        )
        grouped = grouped[['date_time_hour_start', 'stream', 'dummy']]

        plot_list = []

        # Begin iterating through streams
        for stream in grouped.stream.unique():
            # At the moment the name is hardcoded - this needs to change to iterate through given streams
            stream_only = grouped[grouped['stream'] == stream]
            # Get into correct format for Prophet
            stream_only = (
                stream_only.drop('stream', axis=1)
                .rename({'date_time_hour_start': 'ds', 
                         'dummy': 'y'}, axis=1)
                         )

            # log.info(stream_only.head(2))
            
            # 1 week forecast
            model = Prophet(interval_width=0.95)
            model.add_country_holidays(country_name='England')
            model.fit(stream_only)
            future = model.make_future_dataframe(periods=24*7, freq='H', include_history=False)
            fcst = model.predict(future)

            fig  = plot_plotly(model, fcst)

            # Update the x-axis range so we only display the future (i.e. the prediction),
            # not the historic data, otherwise the period we are interested in is so small 
            # as to not be visible
            fig = fig.update_layout(xaxis_range=[stream_only.ds.max().to_pydatetime(), 
                                                 fcst.ds.max()])

            plot_list.append({'stream': stream, 'fig_json': fig.to_json()})
            log.info('Plot created for stream' + str(stream))

        return Response(plot_list, status=status.HTTP_200_OK)