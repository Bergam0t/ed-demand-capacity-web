# Prophet imports
from prophet import Prophet
from prophet.plot import (plot_plotly, plot_components_plotly, 
                           plot_forecast_component)
from prophet.diagnostics import cross_validation, performance_metrics
from prophet.serialize import model_to_json

# Class imports
from .models import *
from .serializers import *

# Plotting imports
import plotly.graph_objs as go

# Python imports
import pandas as pd
import logging
import io
from django.core.files.base import ContentFile
from background_task import background
import json
from datetime import timedelta, datetime
from background_task.models import Task as BackgroundTasks
import numpy as np

# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO,
 format='%(asctime)s %(levelname)-8s %(message)s',
 datefmt='%Y-%m-%d %H:%M:%S')
# Create the logger
log = logging.getLogger(__name__)


# Create a background function that can generate the forecasting model
# and dataframes containing the forecast

@background(schedule=0)
def generate_prophet_models(session_id, data_source, triggered_at=datetime.now()):
    '''
    '''
    log.info('generate_prophet_models() triggered in background')
    
    queryset = HistoricData.objects.filter(uploader_session=session_id)
    # If owner has >1 uploaded data (shouldn't be possible, but best to check), 
    # find the most recent
    historic_data = queryset.last()

    historic_df = pd.read_feather(historic_data.uploaded_data)

    if data_source == "record_csv":
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

        grouped = grouped.rename({"dummy_row": "value"}, axis=1)
    
    elif data_source == "excel":
        grouped = historic_df.copy()
        grouped['date_time_hour_start'] = (
            pd.to_datetime(grouped.Date.astype('str') 
                            + ':' 
                            + grouped.Hour.astype('str'), 
                            format='%Y-%m-%d:%H')
        )

    # Begin iterating through streams
    for stream in grouped.stream.unique():

        # First check whether a model already exists for this user and this stream
        # If the user has deleted their data, then there won't be any existing object
        # If there is already an object, it's likely that the attempt is only happening
        # because of requests that have ended up backed up in the system
        existing_models = ProphetModel.objects.filter(user_session=session_id, stream=stream)

        log.info(f"Existing models: {existing_models}")

        def should_models_be_generated():
            if len(existing_models) == 0:
                return True
            if len(existing_models) > 0:
                # If time request was originally triggered at is after the time the model
                # we are looking at was created, this suggests that the new request should
                # take precendence and overwrite the models and forecasts
                if existing_models.created_at < historic_data.processing_initialised_at:
                    return True
                else:
                    return False

        generate = should_models_be_generated()
        log.info(f"Should models be generated?: {generate}")

        if generate:
            stream_only = grouped[grouped['stream'] == stream]
            # Get into correct format for Prophet
            stream_only = (
                stream_only.drop('stream', axis=1)
                .rename({'date_time_hour_start': 'ds', 
                            'value': 'y'}, axis=1)
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
            
            # In pd.to_csv(), if you do not provide a path, it returns the csv as a string
            # which is good because it's what the later file update step needs
            # However, everything like .to_pickle, .to_feather and .to_hdf does not
            # provide this option, so you need to workaround this by writing the dataframe
            # to a buffer, returning to the beginning of the buffer, and then passing
            # this buffer to the file save. 

            # Set compression to "uncompressed" to avoid a bug relating to lz4 compression

            buf = io.BytesIO()
            fcst.to_feather(buf, compression="uncompressed")
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
        

        historic_data.processing_complete = True
        historic_data.save(update_fields=['processing_complete'])

        log.info("All model and forecast generation complete")
    else:
        # If the request was triggered before the existing models were
        # created, this suggests that it's an old request that's hanging
        # around because e.g. the user deleted the dataset and uploaded another
        # one before the initial round of processing was complete. In that case,
        # we will want to delete any remaining background tasks associated with the user
        background_tasks = BackgroundTasks.objects.all()
        my_tasks = []
        for task in background_tasks:
            try:
                if task.task_params[1]['session_id'] == session_id:
                    my_tasks.append(task.id)
            except:
                pass
        for id in my_tasks:
            BackgroundTasks.objects.delete(id=id)




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






def plot_plotly_history_optional(m, fcst, uncertainty=True, plot_cap=True, trend=False, 
                changepoints=False, changepoints_threshold=0.01, 
                xlabel='ds', ylabel='y', figsize=(900, 600),
                exclude_history=False, history_as_lines=False,
                history_to_include='All'):
    """
    Plot the Prophet forecast with Plotly offline.

    ---------------------------
    MODIFIED VERSION OF PLOT_PLOTLY FROM THE PROPHET LIBRARY

    The original function does not allow you to leave out the historic data, and as there is 
    so much in this model it was unbearably slow to plot 

    ---------------------------

    Plotting in Jupyter Notebook requires initializing plotly.offline.init_notebook_mode():
    >>> import plotly.offline as py
    >>> py.init_notebook_mode()
    Then the figure can be displayed using plotly.offline.iplot(...):
    >>> fig = plot_plotly(m, fcst)
    >>> py.iplot(fig)
    see https://plot.ly/python/offline/ for details
    
    Parameters
    ----------
    m: Prophet model.
    fcst: pd.DataFrame output of m.predict.
    uncertainty: Optional boolean to plot uncertainty intervals.
    plot_cap: Optional boolean indicating if the capacity should be shown
        in the figure, if available.
    trend: Optional boolean to plot trend
    changepoints: Optional boolean to plot changepoints
    changepoints_threshold: Threshold on trend change magnitude for significance.
    xlabel: Optional label name on X-axis
    ylabel: Optional label name on Y-axis
    exclude_history: optional boolean to omit history from the plot
    history_as_lines: optional boolean to plot history as a line instead of as marker points
    history_to_include: optional timedelta to specify the amount of history to include. Will
        be ignored if exclude_history == True.

    Returns
    -------
    A Plotly Figure.
    """
    prediction_color = '#0072B2'
    error_color = 'rgba(0, 114, 178, 0.2)'  # '#0072B2' with 0.2 opacity
    actual_color = 'black'
    cap_color = 'black'
    trend_color = '#B23B00'
    line_width = 2
    marker_size = 4

    data = []

    if history_as_lines:
        history_mode = 'lines'
    else:
        history_mode = 'markers'

    if not exclude_history:
        if history_to_include != 'All':
            if type(history_to_include) == timedelta:
                m.history = m.history[m.history['ds'] > m.history['ds'].max() - history_to_include]
            else:
                log.error("history_to_include was not passed a timedelta object. All history will be shown.")

    # Add actual
        data.append(go.Scatter(
            name='Actual',
            x=m.history['ds'],
            y=m.history['y'],
            marker=dict(color=actual_color, size=marker_size),
            mode=history_mode
        ))

    # Add lower bound
    if uncertainty and m.uncertainty_samples:
        data.append(go.Scatter(
            x=fcst['ds'],
            y=fcst['yhat_lower'],
            mode='lines',
            line=dict(width=0),
            hoverinfo='skip'
        ))
    # Add prediction
    data.append(go.Scatter(
        name='Predicted',
        x=fcst['ds'],
        y=fcst['yhat'],
        mode='lines',
        line=dict(color=prediction_color, width=line_width),
        fillcolor=error_color,
        fill='tonexty' if uncertainty and m.uncertainty_samples else 'none'
    ))
    # Add upper bound
    if uncertainty and m.uncertainty_samples:
        data.append(go.Scatter(
            x=fcst['ds'],
            y=fcst['yhat_upper'],
            mode='lines',
            line=dict(width=0),
            fillcolor=error_color,
            fill='tonexty',
            hoverinfo='skip'
        ))
    # Add caps
    if 'cap' in fcst and plot_cap:
        data.append(go.Scatter(
            name='Cap',
            x=fcst['ds'],
            y=fcst['cap'],
            mode='lines',
            line=dict(color=cap_color, dash='dash', width=line_width),
        ))
    if m.logistic_floor and 'floor' in fcst and plot_cap:
        data.append(go.Scatter(
            name='Floor',
            x=fcst['ds'],
            y=fcst['floor'],
            mode='lines',
            line=dict(color=cap_color, dash='dash', width=line_width),
        ))
    # Add trend
    if trend:
        data.append(go.Scatter(
            name='Trend',
            x=fcst['ds'],
            y=fcst['trend'],
            mode='lines',
            line=dict(color=trend_color, width=line_width),
        ))
    # Add changepoints
    if changepoints and len(m.changepoints) > 0:
        signif_changepoints = m.changepoints[
            np.abs(np.nanmean(m.params['delta'], axis=0)) >= changepoints_threshold
        ]
        data.append(go.Scatter(
            x=signif_changepoints,
            y=fcst.loc[fcst['ds'].isin(signif_changepoints), 'trend'],
            marker=dict(size=50, symbol='line-ns-open', color=trend_color,
                        line=dict(width=line_width)),
            mode='markers',
            hoverinfo='skip'
        ))

    layout = dict(
        showlegend=False,
        width=figsize[0],
        height=figsize[1],
        yaxis=dict(
            title=ylabel
        ),
        xaxis=dict(
            title=xlabel,
            type='date',
            rangeselector=dict(
                buttons=list([
                    dict(count=7,
                         label='1w',
                         step='day',
                         stepmode='backward'),
                    dict(count=1,
                         label='1m',
                         step='month',
                         stepmode='backward'),
                    dict(count=6,
                         label='6m',
                         step='month',
                         stepmode='backward'),
                    dict(count=1,
                         label='1y',
                         step='year',
                         stepmode='backward'),
                    dict(step='all')
                ])
            ),
            rangeslider=dict(
                visible=True
            ),
        ),
    )
    fig = go.Figure(data=data, layout=layout)
    return fig
