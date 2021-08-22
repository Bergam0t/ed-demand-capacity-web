from .serializers import *
from .models import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
import logging
import pandas as pd
from rest_framework.authtoken.models import Token

# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO)
# Create the logger
log = logging.getLogger(__name__)

import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta

# Prophet imports
from prophet.serialize import model_from_json
from prophet.plot import plot_plotly

from .forecast_utils import plot_plotly_history_optional

# ---- VIEWS ---- #

class ProphetForecastPlot(APIView):
    '''
    Return an array of plotly plots of historical data and future data

    Items in array are json representations of Plotly plots

    One item per stream

    Focus view on the forecast
    '''
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

        return Response(plot_list, status=status.HTTP_200_OK)


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

        fig  = plot_plotly_history_optional(model, fcst, 
            history_to_include=timedelta(days=365),
            xlabel='Date', ylabel='Predicted Attendances for Stream', show_legend=True)

        plot_list = [{'title': stream, 'fig_json': fig.to_json()}]
        log.info('Plot created for stream ' + str(stream))

        return Response(plot_list, status=status.HTTP_200_OK)


