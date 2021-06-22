from django.urls import path, include
from .views import *
from .views_forecasting import *


urlpatterns = []


# --- Historic Data --- #

# Historic data upload
urlpatterns += [

    path('historic-data', 
         HistoricDataView.as_view(), 
         name='historic_data_list'),

    path('session-has-historic-data', 
         SessionHasHistoricData.as_view(), 
         name='session_has_historic_data'),

     path('delete-session-historic-data', 
         DeleteSessionHistoricData.as_view(),  
         name='delete_session_historic_data'),

    path('get-historic-data-columns', 
        GetSessionHistoricDataColumnNames.as_view(),  
        name='get_historic_data_columns'),

    path('filter-by-cols-and-overwrite-data', 
        FilterByColsAndOverwriteData.as_view(),  
        name='filter_by_cols_and_overwrite_data'),
    ]

# Historic data viewing (tabular)
urlpatterns += [
    path('most-recently-uploaded-historic-data', 
         DisplayMostRecentlyUploadedRawData.as_view(), 
         name='most_recent_hist'),

    path('most-recently-uploaded-historic-data-own', 
         DisplayMostRecentlyUploadedOwnRawData.as_view(), 
         name='most_recent_hist'),
    
    path('most-recently-uploaded-historic-data-pandas', 
         MostRecentAsPandas.as_view(), 
         name='most_recent_hist_pandas'),
]

# Paths for historic data plots
urlpatterns += [
    path('most-recently-uploaded-historic-data-plotly-ms', 
         PlotlyTimeSeriesMostRecent.as_view(), 
         name='most_recent_hist_plotly_ms'),

     path('most-recently-uploaded-data-forecast', 
         ProphetForecastOneWeekMajors.as_view(), 
         name='most_recent_forecast'),

     path('most-recently-uploaded-ag-grid-json', 
         MostRecentAsAgGridJson.as_view(), 
         name='most_recent_ag_grid_json'),

]


# --- Forecasting --- #

# Forecasting plots
     
urlpatterns += [
     path('most-recently-uploaded-data-forecast', 
         ProphetForecastOneWeekMajors.as_view(), 
         name='most_recent_forecast'),
]


# --- Authentication --- #

# *TODO* Check whether I actually used this in the end!
urlpatterns += [
    path('api-auth/', 
         include('rest_framework.urls')
         ),
]

# --- Misc --- #

urlpatterns+= [
    path('organisation', 
         OrganisationView.as_view()),
         ]