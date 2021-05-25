from django.urls import path
from .views import index

# Needed to allow redirection from other apps 
app_name = 'frontend'

urlpatterns = [
    # name needs to be set if redirecting here from a different app
    path('', index, name=''),
]
