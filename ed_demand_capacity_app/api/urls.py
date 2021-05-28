from django.urls import path
from .views import *

urlpatterns = [
    path('organisation', OrganisationView.as_view()),
    path('historic-data', HistoricDataView.as_view(), name='historic_data_list')
]