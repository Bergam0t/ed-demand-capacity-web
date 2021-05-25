from django.urls import path
from .views import *

urlpatterns = [
    path('organisation', OrganisationView.as_view()),
]