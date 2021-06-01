from django.urls import path
from .views import *

urlpatterns = [
    path('organisation', 
         OrganisationView.as_view()),

    path('historic-data', 
         HistoricDataView.as_view(), 
         name='historic_data_list'),

    path('most-recently-uploaded-historic-data', 
         DisplayMostRecentlyUploadedRawData.as_view(), 
         name='most_recent_hist'),
    
    path('most-recently-uploaded-historic-data-pandas', 
         MostRecentAsPandas.as_view(), 
         name='most_recent_hist_pandas'),

    path('most-recently-uploaded-historic-data-plotly-ms', 
         PlotlyTimeSeriesMostRecent.as_view(), 
         name='most_recent_hist_plotly_ms'),

]