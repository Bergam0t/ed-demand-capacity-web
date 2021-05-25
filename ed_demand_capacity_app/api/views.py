from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from .models import *

# Create your views here.
class OrganisationView(generics.CreateAPIView):
    queryset = Organisation.objects.all()
    serializer_class = OrganisationSerializer