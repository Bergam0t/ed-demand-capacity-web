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
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.core.files.base import ContentFile

# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO)
# Create the logger
log = logging.getLogger(__name__)

# ---- VIEWS ---- #

class OrganisationView(generics.CreateAPIView):
    queryset = Organisation.objects.all()
    serializer_class = OrganisationSerializer

class HistoricDataView(APIView):
    '''
    Upload historic data in csv format

    Get method returns filenames, uploader details and time
    '''
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, *args, **kwargs):
        historic_data = HistoricData.objects.all()
        serializer = UploadedHistoricDataSerializer(historic_data, 
                                                    many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        # If the current user doesn't have a current session with our server
        # then create one
        log.info(self.request.session.session_key)
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        
        log.info(request.data)

        historic_data_serializer = UploadedHistoricDataSerializer(data=request.data)
       
        if historic_data_serializer.is_valid():
            historic_data_instance = historic_data_serializer.save()
            # Update with the session key
            # I had to do it here as it throws a wobbly if you try 
            # to modify the request data, even if you copy it first
            log.info(self.request.session.session_key)
            historic_data_instance.uploader_session = self.request.session.session_key
            # if request.user.is_authenticated():
            #     historic_data_instance.uploader_email = 
            # historic_data_instance.save(update_fields=['uploader_session'])
            historic_data_instance.save()

            return Response(historic_data_serializer.data, 
                            status=status.HTTP_201_CREATED)
        else:
            log.error('error', historic_data_serializer.errors)
            return Response(historic_data_serializer.errors, 
                            status=status.HTTP_400_BAD_REQUEST)

class SessionHasHistoricData(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        # log.info(request.session.session_key)
        queryset = HistoricData.objects.filter(uploader_session=uploader)

        if len(queryset) >= 1:
            return Response({'result': True}, status=status.HTTP_200_OK)
        else:
            return Response({'result': False}, status=status.HTTP_200_OK)

class DeleteSessionHistoricData(APIView):
    def post(self, request, *args, **kwargs):
        uploader = request.session.session_key
        HistoricData.objects.filter(uploader_session=uploader).delete()

        return Response({'result': 'Session data deleted'}, status=status.HTTP_200_OK)

class FilterByColsAndOverwriteData(APIView):
    def post(self, request, *args, **kwargs):

        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data (shouldn't be possible but worth handling), 
        # find the most recent
        historic_data = queryset.last()
        
        # log.info(type(historic_data.uploaded_data))
        # log.info(historic_data.uploaded_data)
        log.info(historic_data.uploaded_data.name)

        df = pd.read_csv(historic_data.uploaded_data)
        
        # log.info(self.request.data)
        columns_from_request = ColumnSelectSerializer(self.request.data).data
        # log.info(columns_from_request)
        

        filtered_df = df[[columns_from_request['datetime_column'], 
                          columns_from_request['stream_column']
                          ]]
        
        filtered_df = filtered_df.rename(
            {columns_from_request['datetime_column']: 'datetime',
             columns_from_request['stream_column']: 'stream'}, 
             axis=1
        )

        # Update existing model
        # First argument is the filepath
        # Second argument is the file itself
        historic_data.uploaded_data.save(
            historic_data.uploaded_data.name.replace('historic_data/', '', 1), 
            ContentFile(filtered_df.to_csv())
            )
        
        return Response({'Message': 'Successfully updated selected columns'}, status=status.HTTP_200_OK)

class GetSessionHistoricDataColumnNames(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        # log.info(request.session.session_key)
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()

        df = pd.read_csv(historic_data.uploaded_data)

        return Response({'columns': df.columns}, status=status.HTTP_200_OK)

class DisplayMostRecentlyUploadedRawData(APIView):
    def get(self, request, *args, **kwargs):
        # uploader = request.session.session_key
        # For some reason session id doesn't appear to be persisting properly
        # So for now just take the last object regardless of uploader
        # queryset = HistoricData.objects.filter(uploader=uploader)
        queryset = HistoricData.objects
        log.info(f"Session Key without self: {request.session.session_key}")
        log.info(f"Session Key with self: {self.request.session.session_key}")
        historic_data = queryset.last()
        # serializer = UploadedHistoricDataSerializer(historic_data, 
        #                                             many=False)
        
        return Response(UploadedHistoricDataSerializer(historic_data, 
                                                    many=False).data, status=status.HTTP_200_OK)

class DisplayMostRecentlyUploadedOwnRawData(APIView):
    def get(self, request, *args, **kwargs):
        # if not request.session.exists(request.session.session_key):
        #     request.session.create()
        # Filter down to last uploaded data (as id'd by session key)
        
        uploader = request.session.session_key
        log.info(request.session.session_key)
        queryset = HistoricData.objects.filter(uploader_session=uploader)

        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()

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
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        historic_data = queryset.last()
        return pd.read_csv(historic_data.uploaded_data)

class MostRecentAsAgGridJson(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()
        # with open(historic_data.uploaded_data) as f:
        #     ncols = len(f.readline().split(','))
        data = pd.read_csv(historic_data.uploaded_data, 
        # usecols=range(2, ncols)
        )

        return  JsonResponse(data.to_dict(orient='records'), status=status.HTTP_200_OK, safe=False)

class PlotlyTimeSeriesMostRecent(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()
        # with open(historic_data.uploaded_data) as f:
        #     ncols = len(f.readline().split(','))

        imported = pd.read_csv(historic_data.uploaded_data)
        
        # *TODO* Improve handling of dates
        # Try catch?
        # Add some notifications explaining what has been assumed?
        imported['corrected_date_time'] = (
            pd.to_datetime(imported['datetime'], 
                        #   format='%Y-%m-%d %H:%M:%S')
            )
        )

        imported['dummy_row'] = 1
        
        pivot_dt = imported.pivot_table(index='corrected_date_time', 
                                        columns='stream', 
                                        values='dummy_row', 
                                        aggfunc='count').fillna(0)
        
        plotting_df_ms = pivot_dt.resample('MS').sum()[1:-1]
        
        fig = px.line(data_frame=plotting_df_ms.reset_index(), 
                      x='corrected_date_time', 
                      y=plotting_df_ms.columns,
                      labels={'corrected_date_time': 'Date',
                              'value': 'Number of visits per month',
                              'variable': 'Stream'})

        return Response(fig.to_json(), status=status.HTTP_200_OK)


class NotesView(APIView):
    def get(self, request, *args, **kwargs):
        user_session_key = request.session.session_key
        queryset = Notes.objects.filter(user_session=user_session_key)
        user_notes = queryset.last()

        return Response(
            NotesSerializer(user_notes, 
                                           many=False).data, 
                        status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        
        serializer_class = NotesSerializer
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            notes = serializer.data.set('notes')
            
            # Get any existing notes
            user_session_key = request.session.session_key
            queryset = Notes.objects.filter(user_session=user_session_key)

            if queryset.exists():
                user_notes_object = queryset.last()
                user_notes_object.notes = notes
                user_notes_object.save(update_fields=['notes'])
                return Response({"Message": "Notes updated successfully"}, 
                                status=status.HTTP_200_OK)
            
            # If no existing notes, create new notes object
            else:
                user_notes_object = Notes(user_session = user_session_key,
                                          notes=notes)
                return Response({"Message": "Notes created successfully"}, 
                                status=status.HTTP_200_OK)


# class UserDetailsFromToken(APIView):
#     def get(self, request, *args, **kwargs):
#         user = Token.objects.get(key='token string').user
#         return Response(