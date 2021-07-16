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
from rest_framework.authtoken.models import Token
import json
from prophet.serialize import model_from_json

# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO)
# Create the logger
log = logging.getLogger(__name__)

import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta

# Prophet imports
from prophet import Prophet
from prophet.plot import (plot_plotly, plot_components_plotly, 
                           plot_forecast_component)
from prophet.diagnostics import cross_validation, performance_metrics

from .forecast_utils import plot_plotly_history_optional

# ---- VIEWS ---- #

class ProphetForecastPlot(APIView):
    def get(self, request, *args, **kwargs):
        user = request.session.session_key
        
        # Get prophet model
        model_queryset = ProphetModel.objects.filter(user_session=user)

        # Get streams
        list_of_streams = []
        for model_entry in model_queryset:
            list_of_streams.append(model_entry.stream)

        # Remove any duplicate stream names
        list_of_streams = list(set(list_of_streams))

        # Create empty list to store plot jsons in
        plot_list = []
        
        for stream in list_of_streams:
            
            # Get future dataframe
            future_df_queryset = ProphetForecast.objects.filter(
                user_session=user,
                stream=stream).last()
            
            fcst = pd.read_feather(future_df_queryset.prophet_forecast_df_feather)

            prophet_model = ProphetModel.objects.filter(
                user_session=user,
                stream=stream).last()

            model = model_from_json(prophet_model.prophet_model_json)

            fig  = plot_plotly(model, fcst)

            # Update the x-axis range so we only display the future (i.e. the prediction),
            # not the historic data, otherwise the period we are interested in is so small 
            # as to not be visible
            fig = fig.update_layout(xaxis_range=[fcst.ds.max() - timedelta(weeks=8), 
                                                 fcst.ds.max()])

            plot_list.append({'title': stream, 'fig_json': fig.to_json()})
            log.info('Plot created for stream ' + str(stream))

        return Response([plot_list[0]], status=status.HTTP_200_OK)


class ProphetForecastIndividualPlot(APIView):
    def get(self, request, *args, **kwargs):
        user = request.session.session_key
        stream = request.query_params['stream']

        future_df_queryset = ProphetForecast.objects.filter(
            user_session=user,
            stream=stream).last()
        
        fcst = pd.read_feather(future_df_queryset.prophet_forecast_df_feather)

        prophet_model = ProphetModel.objects.filter(
            user_session=user,
            stream=stream).last()

        model = model_from_json(prophet_model.prophet_model_json)

        # fig  = plot_plotly_history_optional(model, fcst, include_history=False)
        fig  = plot_plotly_history_optional(model, fcst, include_history=True,
        history_to_include=timedelta(days=365))
        # Update the x-axis range so we only display the future (i.e. the prediction),
        # not the historic data, otherwise the period we are interested in is so small 
        # as to not be visible
        # fig = fig.update_layout(xaxis_range=[fcst.ds.max() - timedelta(weeks=8), 
        #                                         fcst.ds.max()])

        plot_list = [{'title': stream, 'fig_json': fig.to_json()}]
        log.info('Plot created for stream ' + str(stream))

        return Response(plot_list, status=status.HTTP_200_OK)


# class ProphetForecastOneWeekMajors(APIView):
#     def get(self, request, *args, **kwargs):
#         uploader = request.session.session_key
#         queryset = HistoricData.objects.filter(uploader_session=uploader)
#         # If owner has >1 uploaded data, find the most recent
#         historic_data = queryset.last()

#         # Convert the uploaded csv to a pandas dataframe
#         historic_df = pd.read_feather(historic_data.uploaded_data)
#         historic_df['datetime'] = pd.to_datetime(historic_df['datetime'])
        
#         grouped = historic_df.groupby(['date', 'hour', 'stream']).count()[['dummy_row']].reset_index()
        
#         grouped['date_time_hour_start'] = (
#             pd.to_datetime(grouped.date.astype('str') 
#                            + ':' 
#                            + grouped.hour.astype('str'), 
#                            format='%Y-%m-%d:%H')
#         )
        
#         grouped = grouped[['date_time_hour_start', 'stream', 'dummy']]

#         plot_list = []

#         # Begin iterating through streams
#         for stream in grouped.stream.unique():
#             # At the moment the name is hardcoded - this needs to change to iterate through given streams
#             stream_only = grouped[grouped['stream'] == stream]
#             # Get into correct format for Prophet
#             stream_only = (
#                 stream_only.drop('stream', axis=1)
#                 .rename({'date_time_hour_start': 'ds', 
#                          'dummy': 'y'}, axis=1)
#                          )

#             # log.info(stream_only.head(2))
            
#             # 1 week forecast
#             model = Prophet(interval_width=0.95)
#             model.add_country_holidays(country_name='England')
#             model.fit(stream_only)
#             future = model.make_future_dataframe(periods=24*7, freq='H', include_history=False)
#             fcst = model.predict(future)

#             fig  = plot_plotly(model, fcst)

#             # Update the x-axis range so we only display the future (i.e. the prediction),
#             # not the historic data, otherwise the period we are interested in is so small 
#             # as to not be visible
#             fig = fig.update_layout(xaxis_range=[stream_only.ds.max().to_pydatetime(), 
#                                                  fcst.ds.max()])

#             plot_list.append({'title': stream, 'fig_json': fig.to_json()})
#             log.info('Plot created for stream' + str(stream))

#         return Response(plot_list, status=status.HTTP_200_OK)