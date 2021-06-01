from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from .models import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
import logging
import pandas as pd
from rest_pandas import PandasSimpleView
import pandas as pd
import plotly.express as px
from datetime import datetime

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


class DisplayMostRecentlyUploadedRawData(APIView):
    def get(self, request, *args, **kwargs):
        uploader = self.request.session.session_key
        # For some reason session id doesn't appear to be persisting properly
        # So for now just take the last object regardless of uploader
        # queryset = HistoricData.objects.filter(uploader=uploader)
        queryset = HistoricData.objects
        historic_data = queryset.last()
        # serializer = UploadedHistoricDataSerializer(historic_data, 
        #                                             many=False)

        return Response(UploadedHistoricDataSerializer(historic_data, 
                                                    many=False).data, status=status.HTTP_200_OK)

# class MostRecentAsPandas(APIView):
#     def get(self, request, *args, **kwargs):
#         uploader = self.request.session.session_key
#         # For some reason session id doesn't appear to be persisting properly
#         # So for now just take the last object regardless of uploader
#         # queryset = HistoricData.objects.filter(uploader=uploader)
#         queryset = HistoricData.objects
#         historic_data = queryset.last()
        
#         # Convert csv to pandas dataframe
#         df = pd.read_csv(historic_data['uploaded_data'])

#         log.info(df.head(1))

#         return Response(UploadedHistoricDataSerializer(historic_data, 
#                                                     many=False).data, status=status.HTTP_200_OK)

class MostRecentAsPandas(PandasSimpleView):
    def get_data(self, request, *args, **kwargs):
        queryset = HistoricData.objects
        historic_data = queryset.last()
        return pd.read_csv(historic_data.uploaded_data)

class PlotlyTimeSeriesMostRecent(APIView):
    def get(self, request, *args, **kwargs):
        queryset = HistoricData.objects
        historic_data = queryset.last()
        # with open(historic_data.uploaded_data) as f:
        #     ncols = len(f.readline().split(','))

        imported = pd.read_csv(historic_data.uploaded_data)
        imported['arrival_time'] = pd.to_datetime(imported['arrival_time'])
        imported['corrected_date_time'] = pd.to_datetime(imported.date + ':' + imported['arrival_time'].dt.time.astype('str'), format='%Y-%m-%d:%H:%M:%S')
        pivot_dt = imported.pivot_table(index='corrected_date_time', columns='stream', values='nhs_number', aggfunc='count').fillna(0)
        plotting_df_ms = pivot_dt.resample('MS').sum()[1:-1]
        fig = px.line(data_frame=plotting_df_ms.reset_index(), x='corrected_date_time', y=plotting_df_ms.columns)

        return Response(fig.to_json(), status=status.HTTP_200_OK)