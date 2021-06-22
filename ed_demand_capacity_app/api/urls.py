from django.urls import path, include
from .views import *
from .views_forecasting import *



urlpatterns = [
    path('organisation', 
         OrganisationView.as_view()),

    path('historic-data', 
         HistoricDataView.as_view(), 
         name='historic_data_list'),

    path('most-recently-uploaded-historic-data', 
         DisplayMostRecentlyUploadedRawData.as_view(), 
         name='most_recent_hist'),

    path('most-recently-uploaded-historic-data-own', 
         DisplayMostRecentlyUploadedOwnRawData.as_view(), 
         name='most_recent_hist'),
    
    path('most-recently-uploaded-historic-data-pandas', 
         MostRecentAsPandas.as_view(), 
         name='most_recent_hist_pandas'),

    path('most-recently-uploaded-historic-data-plotly-ms', 
         PlotlyTimeSeriesMostRecent.as_view(), 
         name='most_recent_hist_plotly_ms'),

     path('most-recently-uploaded-data-forecast', 
         ProphetForecastOneWeekMajors.as_view(), 
         name='most_recent_forecast'),

     path('most-recently-uploaded-ag-grid-json', 
         MostRecentAsAgGridJson.as_view(), 
         name='most_recent_ag_grid_json'),

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
     


     # path('get-user', 
     #      UserDetailsFromToken.as_view(), 
     #      name="user_details_from_token"),

]

urlpatterns += [
    path('api-auth/', include('rest_framework.urls')),
]