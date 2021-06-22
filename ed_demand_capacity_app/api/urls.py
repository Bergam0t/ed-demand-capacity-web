from django.urls import path, include
from .views import *
from .views_forecasting import *
from .views_shifts_rotas import *


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



# --- Shifts --- #

# Following https://www.youtube.com/watch?v=TmsD8QExZ84

urlpatterns += [
    path('all-shift-types-anonymous', 
         ViewAllShiftTypesAnonymous.as_view(), 
         name='view_all_shift_types_anonymous'),

    path('own-shift-types', 
         ViewOwnShiftTypes.as_view(), 
         name='view_own_shift_types'),
    
    path('individual-shift-type-own/<str:pk>', 
         ViewIndividualShiftOwn.as_view(), 
         name='view_individual_shift_type_own'),
    
    path('individual-shift-type-any-anonymous/<str:pk>', 
         ViewIndividualShiftAnyAnonymous.as_view(), 
         name='view_individual_shift_type_any_anonymous'),

    path('create-shift-type', 
         CreateShiftType.as_view(), 
         name='create_shift_type'),

    path('update-shift-type/<str:pk>', 
         UpdateShiftType.as_view(), 
         name='update_shift_type'),

    path('delete-shift-type/<str:pk>', 
         DeleteShiftType.as_view(), 
         name='delete_shift_type'),
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
         