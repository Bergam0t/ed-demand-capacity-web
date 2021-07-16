# Django imports
from django.shortcuts import render
from django.http import JsonResponse
from django.core.files.base import ContentFile

# DRF imports
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_pandas import PandasSimpleView
from .forecast_utils import *

# Class imports
from .serializers import *
from .models import *

# Python imports
import logging
import pandas as pd
import pandas as pd
import plotly.express as px
from datetime import datetime
import tempfile
import os
import io
import time


# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO,
 format='%(asctime)s %(levelname)-8s %(message)s',
 datefmt='%Y-%m-%d %H:%M:%S')
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
            # First, save the response as is so that we have a model object that exists
            historic_data_instance = historic_data_serializer.save()
            
            # Update with the session key
            # I had to do it here as it throws a wobbly if you try 
            # to modify the request data, even if you copy it first
            log.info(self.request.session.session_key)
            historic_data_instance.uploader_session = self.request.session.session_key
            
            # Next, grab the uploaded csv and convert it to a pandas dataframe
            df = pd.read_csv(historic_data_instance.uploaded_data)

            # Update csv to feather file
            # Using feather from here on in as it allows datatypes to persist
            # across file loads, meaning we won't have to repeatedly parse dates,
            # which is a very time-consuming operation 

            # First get the filepath and apply some corrections so it goes to the correct folder
            # and updates the filetype suffix
            csv_filepath = historic_data_instance.uploaded_data.name
            
            filepath =  (
                csv_filepath
                .replace('historic_data/', '', 1)
                .replace('csv', 'ftr')
            )

            # In pd.to_csv(), if you do not provide a path, it returns the csv as a string
            # which is good because it's what the later file update step needs
            # However, everything like .to_pickle, .to_feather and .to_hdf does not
            # provide this option, so you need to workaround this by writing the dataframe
            # to a buffer, returning to the beginning of the buffer, and then passing
            # this buffer to the file save. 
            buf = io.BytesIO()
            df.to_feather(buf)
            buf.seek(0)

            # Note that we have to use buf.read(), not just buf, 
            # else we receive errors relating to this not being a 
            # bytes-like object 
            historic_data_instance.uploaded_data.save(
                filepath,
                ContentFile(buf.read())
                )

            # if request.user.is_authenticated():
            #     historic_data_instance.uploader_email = 
            # historic_data_instance.save(update_fields=['uploader_session'])

            # Save the updated historic data instance
            historic_data_instance.save()

            # Tidy up by deleting the originally-uploaded csv
            log.info(f'csv filepath: {csv_filepath}')
            if os.path.isfile(f'uploads/{csv_filepath}'):
                os.remove(f'uploads/{csv_filepath}')
                log.info('csv file deleted')

            return Response(historic_data_serializer.data, 
                            status=status.HTTP_201_CREATED)
        else:
            log.error('error', historic_data_serializer.errors)
            return Response(historic_data_serializer.errors, 
                            status=status.HTTP_400_BAD_REQUEST)

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

        df = pd.read_feather(historic_data.uploaded_data)
        
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

        filtered_df['datetime'] = pd.to_datetime(filtered_df['datetime'])

        filtered_df['dummy_row'] = 1

        filtered_df['date'] = filtered_df['datetime'].dt.date
        filtered_df['hour'] = filtered_df['datetime'].dt.hour

        # Update existing model
        # First get the filepath and apply some corrections so it goes to the correct folder
        # and updates the filetype suffix
        filepath =  (
            historic_data.uploaded_data.name
            .replace('historic_data/', '', 1)
        )

        # In pd.to_csv(), if you do not provide a path, it returns the csv as a string
        # which is good because it's what the later file update step needs
        # However, everything like .to_pickle, .to_feather and .to_hdf does not
        # provide this option, so you need to workaround this by writing the dataframe
        # to a buffer, returning to the beginning of the buffer, and then passing
        # this buffer to the file save. 
        buf = io.BytesIO()
        filtered_df.to_feather(buf)
        buf.seek(0)

        # Note that we have to use buf.read(), not just buf, 
        # else we receive errors relating to this not being a 
        # bytes-like object 
        historic_data.uploaded_data.save(
            filepath,
            ContentFile(buf.read())
            )
        
        log.info('Successfully updated selected columns')

        # Set the prophet models to start generating in the background
        generate_prophet_models(session_id = uploader)

        
        return Response({'Message': 'Successfully processed data'}, 
                        status=status.HTTP_200_OK)

class SessionHasHistoricData(APIView):
    '''
    Checks whether there is historic data associated with a user's session
    and returns a boolean response
    '''
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)

        if len(queryset) >= 1:
            return Response({'result': True}, status=status.HTTP_200_OK)
        else:
            return Response({'result': False}, status=status.HTTP_200_OK)

class DeleteSessionHistoricData(APIView):
    '''
    On POST, deletes historic data associated with the user's session
    from both the database and the file system
    '''
    def post(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data (shouldn't be possible but worth handling), 
        # find the most recent
        historic_data = queryset.last()
        # Get the filepath
        filepath = historic_data.uploaded_data.name

        # Delete from the database
        HistoricData.objects.filter(uploader_session=uploader).delete()
        log.info('database entry deleted')

        # Delete the file
        log.info(f'Filepath: {filepath}')
        if os.path.isfile(f'uploads/{filepath}'):
            for i in range(3):
                try: 
                    os.remove(f'uploads/{filepath}')
                    log.info(f'uploads/{filepath} deleted')
                except PermissionError:
                    log.info(f'Permission error: retrying in 1s')
                    time.sleep(1)
                else:
                    log.info(f'Unable to delete uploads/{filepath} after 3 attempts. Will clear up on next scheduled cleanup cycle.')

        return Response({'result': 'Session data deleted'}, 
                        status=status.HTTP_200_OK)



class GetSessionHistoricDataColumnNames(APIView):
    '''
    Return column names found in uploaded historic data as a list
    '''
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        # log.info(request.session.session_key)
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()

        df = pd.read_feather(historic_data.uploaded_data)

        # Get rid of a column which gets accidentally generated
        if "Unnamed: 0" in df:
            df = df.drop("Unnamed: 0", axis=1)

        return Response({'columns': df.columns}, 
                        status=status.HTTP_200_OK)

class GetSessionStreams(APIView):
    '''
    Return ED streams found in uploaded historic data as a list
    '''
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()

        df = pd.read_feather(historic_data.uploaded_data)

        return Response({'streams': df.stream.unique()}, 
                        status=status.HTTP_200_OK)

class DisplayMostRecentlyUploadedRawData(APIView):
    '''
    Testing class for showing last uploaded data regardless
    of who uploaded it
    '''
    def get(self, request, *args, **kwargs):
        queryset = HistoricData.objects
        historic_data = queryset.last()

        return Response(
            UploadedHistoricDataSerializer(historic_data, many=False).data, 
            status=status.HTTP_200_OK
            )

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

class MostRecentAsPandas(PandasSimpleView):
    def get_data(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        historic_data = queryset.last()
        return pd.read_feather(historic_data.uploaded_data)

class MostRecentAsAgGridJson(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()
        # with open(historic_data.uploaded_data) as f:
        #     ncols = len(f.readline().split(','))
        # try:
        #     data = pd.read_csv(historic_data.uploaded_data, 
        #     # usecols=range(2, ncols)
        #     ).drop("Unnamed: 0", axis=1)
        # except:
        data = pd.read_feather(historic_data.uploaded_data)
        log.info(data.columns)
        if "Unnamed: 0" in data.columns:
            data = data.drop("Unnamed: 0", axis=1)

        return  JsonResponse(data.to_dict(orient='records'), status=status.HTTP_200_OK, safe=False)

class PlotlyTimeSeriesMostRecent(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()
        # with open(historic_data.uploaded_data) as f:
        #     ncols = len(f.readline().split(','))

        imported = pd.read_feather(historic_data.uploaded_data)
        log.info("Data read")       
        
        pivot_dt = imported.pivot_table(index='datetime', 
                                        columns='stream', 
                                        values='dummy_row', 
                                        aggfunc='count').fillna(0)
        log.info("Data pivoted")
        
        plotting_df_ms = pivot_dt.resample('MS').sum()[1:-1]
        log.info("Resampling complete")
        
        fig = px.line(data_frame=plotting_df_ms.reset_index(), 
                      x='datetime', 
                      y=plotting_df_ms.columns,
                      labels={'datetime': 'Date',
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
        
        serializer = NotesSerializer(data=request.data)
        
        if serializer.is_valid():
            notes = serializer.data.get('notes')
            log.info("Notes: " + notes)
            
            # Get any existing notes
            user_session_key = request.session.session_key
            queryset = Notes.objects.filter(user_session=user_session_key)

            if queryset.exists():
                log.info("Existing notes updated")
                user_notes_object = queryset.last()
                user_notes_object.notes = notes
                user_notes_object.save(update_fields=['notes'])
                return Response({"Message": "Notes updated successfully"}, 
                                status=status.HTTP_200_OK)
            
            # If no existing notes, create new notes object
            else:
                user_notes_object = Notes(user_session = user_session_key,
                                          notes=notes)
                user_notes_object.save()
                log.info("New notes created")
                return Response({"Message": "Notes created successfully"}, 
                                status=status.HTTP_200_OK)


# class UserDetailsFromToken(APIView):
#     def get(self, request, *args, **kwargs):
#         user = Token.objects.get(key='token string').user
#         return Response(