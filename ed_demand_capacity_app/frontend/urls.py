from django.urls import path, re_path
from .views import index

# Needed to allow redirection from other apps 
app_name = 'frontend'

urlpatterns = [
    # name needs to be set if redirecting here from a different app
    path('', index, name=''),
]

# Add in wildcards that will mop up any requests that go to a specific page
# Without this, navigating to a specific URL manually will return an error
# Also allows the use of the back button
# From OBAA's answer here 
# https://stackoverflow.com/questions/40826295/react-routing-and-django-url-conflict
urlpatterns += [
    # match the root
    re_path(r'^$', index),
    # match all other pages
    re_path(r'^(?:.*)/?$', index),
]