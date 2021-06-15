from django.urls import path, include
from .views import *
from rest_framework_jwt.views import obtain_jwt_token


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

     path('token-auth/', obtain_jwt_token),

     # path('get-user', 
     #      UserDetailsFromToken.as_view(), 
     #      name="user_details_from_token"),

]

urlpatterns += [
    path('api-auth/', include('rest_framework.urls')),
]