# Prophet imports
from prophet import Prophet
from prophet.plot import (plot_plotly, plot_components_plotly, 
                           plot_forecast_component)
from prophet.diagnostics import cross_validation, performance_metrics
from prophet.serialize import model_to_json

# Class imports
from .models import *
from .serializers import *

# Python imports
import pandas as pd
import logging
import io
from django.core.files.base import ContentFile
from background_task import background
import json
from datetime import timedelta

# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO,
 format='%(asctime)s %(levelname)-8s %(message)s',
 datefmt='%Y-%m-%d %H:%M:%S')
# Create the logger
log = logging.getLogger(__name__)


# Create a background function that can generate the forecasting model
# and dataframes containing the forecast

# @background(schedule=1)
def generate_prophet_models(session_id):
    '''
    '''
    log.info('generate_prophet_models() triggered in background')
    queryset = HistoricData.objects.filter(uploader_session=session_id)
    # If owner has >1 uploaded data (shouldn't be possible, but best to check), 
    # find the most recent
    historic_data = queryset.last()

    historic_df = pd.read_feather(historic_data.uploaded_data)

    grouped = (
        historic_df.groupby(['date', 'hour', 'stream'])
        .count()
        [['dummy_row']]
        .reset_index()
        )
    
    grouped['date_time_hour_start'] = (
        pd.to_datetime(grouped.date.astype('str') 
                        + ':' 
                        + grouped.hour.astype('str'), 
                        format='%Y-%m-%d:%H')
    )
    
    # Limit to relevant columns only
    grouped = grouped[['date_time_hour_start', 'stream', 'dummy_row']]

    # Begin iterating through streams
    for stream in grouped.stream.unique():
        stream_only = grouped[grouped['stream'] == stream]
        # Get into correct format for Prophet
        stream_only = (
            stream_only.drop('stream', axis=1)
            .rename({'date_time_hour_start': 'ds', 
                        'dummy_row': 'y'}, axis=1)
        )
        
        # Generate forecasting model
        model = Prophet(interval_width=0.95)
        model.add_country_holidays(country_name='England')
        model.fit(stream_only)
        log.info(f'Model generated for stream {stream}')
        prophet_model_serializer = ProphetModelSerializer(data={
            'user_session': session_id,
            'stream': stream,
            'prophet_model_json': model_to_json(model)
        })
       
        if prophet_model_serializer.is_valid():
            # Save the response as is so that we have a model object that exists
            prophet_model_serializer.save()
            log.info(f'Model saved to database for stream {stream}')
        else:
            log.error(f'Model serializer not valid for stream {stream}')

        # Next, generate and store 8 week dataframes for each stream 
        future = model.make_future_dataframe(periods=24*7*8, 
                                             freq='H', 
                                             include_history=False)
        fcst = model.predict(future)

        log.info(f'Forecast generated for stream {stream}')
        
        buf = io.BytesIO()
        fcst.to_feather(buf)
        buf.seek(0)

        prophet_forecast_serializer = ProphetForecastSerializer(data={
            'user_session': session_id,
            'stream': stream,
            # 'prophet_forecast_df_feather': [session_id + stream + 'forecast', ContentFile(buf.read())]
            })

        if prophet_forecast_serializer.is_valid():
            log.info(f'Forecast serializer valid for stream {stream}')
            # Save the response as is so that we have a model object that exists
            prophet_forecast_instance = prophet_forecast_serializer.save()
            # Then save the file
            # There must be a way to do this all in one call but I know this way works
            # so for now, doing it like
            filepath = f'{session_id}_{stream}_fcst.ftr'
            prophet_forecast_instance.prophet_forecast_df_feather.save(
                filepath,
                ContentFile(buf.read())
                )
            log.info(f'Forecast dataframe saved to database for stream {stream}')
        else:
            log.error(f'Forecast serializer not valid for stream {stream}')




# plot_list = []

#     # Begin iterating through streams
#     for stream in grouped.stream.unique():
#         # At the moment the name is hardcoded - this needs to change to iterate through given streams
#         stream_only = grouped[grouped['stream'] == stream]
#         # Get into correct format for Prophet
#         stream_only = (
#             stream_only.drop('stream', axis=1)
#             .rename({'date_time_hour_start': 'ds', 
#                         'dummy': 'y'}, axis=1)
#                         )

#         # log.info(stream_only.head(2))
        
#         # 1 week forecast
#         model = Prophet(interval_width=0.95)
#         model.add_country_holidays(country_name='England')
#         model.fit(stream_only)
#         future = model.make_future_dataframe(periods=24*7, freq='H', include_history=False)
#         fcst = model.predict(future)

#         fig  = plot_plotly(model, fcst)

#         # Update the x-axis range so we only display the future (i.e. the prediction),
#         # not the historic data, otherwise the period we are interested in is so small 
#         # as to not be visible
#         fig = fig.update_layout(xaxis_range=[stream_only.ds.max().to_pydatetime(), 
#                                                 fcst.ds.max()])

#         plot_list.append({'title': stream, 'fig_json': fig.to_json()})
#         log.info('Plot created for stream' + str(stream))

#     return Response(plot_list, status=status.HTTP_200_OK)