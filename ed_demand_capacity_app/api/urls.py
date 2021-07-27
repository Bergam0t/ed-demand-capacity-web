from django.urls import path, include
from .views import *
from .views_forecasting import *
from .views_shift_types import *
from .views_role_types import *
from .views_rotas import *
from .views_calculate_capacity import *
from .views_additional_factors import *
from .views_scenarios import *

urlpatterns = []


# ------------------------ #
# Historic Data 
# ------------------------ #

# Historic data upload
urlpatterns += [

    path('historic-data', 
         HistoricDataView.as_view(), 
         name='historic_data_list'),

    path('session-has-historic-data', 
         SessionHasHistoricData.as_view(), 
         name='session_has_historic_data'),

     path('session-data-processed', 
         SessionDataProcessed.as_view(), 
         name='session_data_processed'),

     path('delete-session-historic-data', 
         DeleteSessionHistoricData.as_view(),  
         name='delete_session_historic_data'),

    path('get-historic-data-columns', 
        GetSessionHistoricDataColumnNames.as_view(),  
        name='get_historic_data_columns'),

     path('get-historic-data-streams', 
        GetSessionStreams.as_view(),  
        name='get_historic_data_streams'),

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
         ProphetForecastIndividualPlot.as_view(), 
         name='most_recent_forecast_individual'),

     path('most-recently-uploaded-data-forecast-all-streams', 
         ProphetForecastPlot.as_view(), 
         name='most_recent_forecast_all_streams'),

     path('most-recently-uploaded-ag-grid-json', 
         MostRecentAsAgGridJson.as_view(), 
         name='most_recent_ag_grid_json'),

]




# ---------------- #
# Streams
# ---------------- #
urlpatterns += [
     path('get-historic-data-streams-from-db', 
        GetSessionStreamsFromDatabase.as_view(),  
        name='get_historic_data_streams_from_db'),

     path('update-stream-details',
          StreamUpdate.as_view(),
          name='update_stream_details')    

]


# ------------------- #
# Shifts 
# ------------------- #

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

#     path('update-shift-type/<str:pk>', 
#          UpdateShiftType.as_view(), 
#          name='update_shift_type'),

    path('delete-shift-type/<str:pk>', 
         DeleteShiftType.as_view(), 
         name='delete_shift_type'),

     path('own-shift-types-plot', 
         PlotShiftTypes.as_view(), 
         name='own_shift_types_plot'),
]

# ------------------- #
# Roles 
# ------------------- #

# Following https://www.youtube.com/watch?v=TmsD8QExZ84

urlpatterns += [
     path('own-role-types', 
         ViewOwnRoleTypes.as_view(), 
         name='view_own_role_types'),
    
    path('individual-role-type-own/<str:pk>', 
         ViewIndividualRoleOwn.as_view(), 
         name='view_individual_role_type_own'),
    
    path('create-role-type', 
         CreateRoleType.as_view(), 
         name='create_role_type'),

#     path('update-shift-type/<str:pk>', 
#          UpdateShiftType.as_view(), 
#          name='update_shift_type'),

    path('delete-role-type/<str:pk>', 
         DeleteRoleType.as_view(), 
         name='delete_role_type'),

]

# ------------------- #
# Rota entries 
# ------------------- #

# Following https://www.youtube.com/watch?v=TmsD8QExZ84

urlpatterns += [
     path('own-rota-entries', 
         ViewOwnRotaEntries.as_view(), 
         name='view_own_rota_entries'),

     path('own-rota-entries-detailed', 
         ViewOwnRotaEntriesDetailed.as_view(), 
         name='view_own_rota_entries'),
    
    path('individual-rota-entry-own/<str:pk>', 
         ViewIndividualRotaEntryOwn.as_view(), 
         name='view_individual_rota_entry_own'),
    
    path('create-rota-entry', 
         CreateRotaEntry.as_view(), 
         name='create_rota_entry'),

#     path('update-shift-type/<str:pk>', 
#          UpdateShiftType.as_view(), 
#          name='update_shift_type'),

    path('delete-rota-entry/<str:pk>', 
         DeleteRotaEntry.as_view(), 
         name='delete_rota_entry'),

]

# ------------------- #
# Notes
# ------------------- #
urlpatterns+= [
    path('notes', 
         NotesView.as_view()),
         ]


# --------------------------- #
# Additional Factors: Capacity
# --------------------------- #

urlpatterns += [
     path('own-capacity-factors', 
         ViewOwnAdditionalFactorsRequiredCapacity.as_view(), 
         name='view_own_capacity_factors'),
    
    path('create-capacity-factor', 
         CreateRequiredCapacityFactor.as_view(), 
         name='create_capacity_factor'),

    path('delete-capacity-factor/<str:pk>', 
         DeleteAdditionalFactorRequiredCapacity.as_view(), 
         name='delete_capacity_factor'),

]


# --------------------------- #
# Additional Factors: Demand
# --------------------------- #

urlpatterns += [
     path('own-available-capacity-factors', 
         ViewOwnAdditionalFactorsAvailableCapacity.as_view(), 
         name='view_own_available_capacity_factors'),
    
    path('create-available-capacity-factor', 
         CreateAvailableCapacityFactor.as_view(), 
         name='create_available_capacity_factor'),

    path('delete-available-capacity-factor/<str:pk>', 
         DeleteAdditionalFactorAvailableCapacity.as_view(), 
         name='delete_available_capacity_factor'),

]

# ----------------------- #
# Scenarios
# ----------------------- #

urlpatterns+= [
    path('view-or-update-scenarios', 
         ViewCreateOrUpdateScenario.as_view()),
         ]

# ----------------------- #
# Capacity Calculations 
# ----------------------- #

urlpatterns+= [
    path('available-capacity-as-resources-week', 
         GetAvailableCapacityAsResourcesWeek.as_view()),
         ]
         






# ------------------- #
# Authentication 
# ------------------- #

# *TODO* Check whether I actually used this in the end!
urlpatterns += [
    path('api-auth/', 
         include('rest_framework.urls')
         ),
]

# ------------------- #
# Misc
# ------------------- #

# urlpatterns+= [
#     path('organisation', 
#          OrganisationView.as_view()),
#          ]