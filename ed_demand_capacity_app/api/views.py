from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from .models import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
import logging

log = logging.getLogger(__name__)

# Create your views here.
class OrganisationView(generics.CreateAPIView):
    queryset = Organisation.objects.all()
    serializer_class = OrganisationSerializer

class HistoricDataView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, *args, **kwargs):
        historic_data = HistoricData.objects.all()
        serializer = UploadedHistoricDataSerializer(historic_data, 
                                                    many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        # If the current user doesn't have a current session with our server
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        log.info(request.data)

        historic_data_serializer = UploadedHistoricDataSerializer(data=request.data)
       
        if historic_data_serializer.is_valid():
            historic_data_instance = historic_data_serializer.save()
            # Update with the session key
            # I had to do it here as it throws a wobbly if you try 
            # to modify the request data, even if you copy it first
            historic_data_instance.uploader = self.request.session.session_key
            historic_data_instance.save()

            return Response(historic_data_serializer.data, 
                            status=status.HTTP_201_CREATED)
        else:
            print('error', historic_data_serializer.errors)
            return Response(historic_data_serializer.errors, 
                            status=status.HTTP_400_BAD_REQUEST)


# class DisplayRawData(APIView):
#     queryset = 