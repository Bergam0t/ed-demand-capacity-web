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
import re


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


# ------------------------ #
# HISTORIC DATA UPLOAD
# ------------------------ #

def add_stream_models(df, user_session):
    for i, stream in enumerate(df['stream'].unique()):
        stream_data = {'user_session': user_session,
                        'stream_name': stream,
                        # i + 1 so that priority starts at 1, not 0
                        'stream_priority': i+1}
        
        stream_serializer = StreamSerializer(data=stream_data)

        if stream_serializer.is_valid():
            stream_serializer.save()

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
            log.info("Historic data serializer valid")
            # First, save the response as is so that we have a model object that exists
            historic_data_instance = historic_data_serializer.save()
            
            # Update with the session key
            # I had to do it here as it throws a wobbly if you try 
            # to modify the request data, even if you copy it first
            log.info(self.request.session.session_key)
            user_session = self.request.session.session_key
            historic_data_instance.uploader_session = user_session
            
            # ---- If a csv file has been uploaded ---- #
            if bool(re.search('\.csv', historic_data_instance.uploaded_data.name)):
                log.info("csv file uploaded")
                # Next, grab the uploaded csv and convert it to a pandas dataframe
                df = pd.read_csv(historic_data_instance.uploaded_data)

                # Update csv to feather file
                # Using feather from here on in as it allows datatypes to persist
                # across file loads, meaning we won't have to repeatedly parse dates,
                # which is a very time-consuming operation 

                # First get the filepath and apply some corrections so it goes to the correct folder
                # and updates the filetype suffix
                original_filepath = historic_data_instance.uploaded_data.name
                
                filepath =  (
                    original_filepath
                    .replace('historic_data/', '', 1)
                    .replace('csv', 'ftr')
                )

                source = 'record_csv'

            # ---- If an excel file format has been uploaded ---- #
            if bool(re.search('\.xlsb', historic_data_instance.uploaded_data.name)):
                log.info("xlsb file uploaded")
                imported_df = pd.read_excel(historic_data_instance.uploaded_data, 
                                            engine='pyxlsb', 
                                            sheet_name="Demand")
                # Get streams
                stream_row = imported_df.iloc[4, :]
                stream_names = stream_row.dropna().values
                # Ignore any default names
                names_to_ignore = [f'Stream {i} Name' for i in range(1, 11, 1)]
                final_stream_names = [i for i in stream_names 
                      if i not in names_to_ignore]
                # Get only the relevant data
                df = imported_df.iloc[7 : , 1 : 4+len(final_stream_names)]
                # Update column names
                df.columns = ['Date', 'Hour range', 'Hour'] + final_stream_names
                # Get rid of rows from end of dataframe that contain no data
                df = df.iloc[:df.last_valid_index()]
                # Remove any straggler missing data
                # There seems to be odd rows where hour range is 'None' instead
                # of blank, which breaks the command above
                df = df.dropna(subset=df.columns[1:])

                # Fix the dates, which will have been imported as integers
                # First need to fill na values using the forward fill method
                # As there's only one value per day
                df['Date'] = df['Date'].fillna(method='ffill')
                # Convert date using method here
                # https://stackoverflow.com/questions/31359150/convert-date-from-excel-in-number-format-to-date-format-python
                df['Date'] = df['Date'].apply(lambda x: datetime.fromordinal(datetime(1900, 1, 1).toordinal() + x - 2))
                # Convert to datetime format
                df['Date'] = pd.to_datetime(df['Date'])

                # Reshape for more similarity with the Excel file and allow 
                df = df.melt(id_vars=['Date', 'Hour range', 'Hour']).rename({'variable': 'stream'}, axis=1)
                

                # Then add stream models
                add_stream_models(df=df, user_session=user_session)

                original_filepath = historic_data_instance.uploaded_data.name
                
                filepath =  (
                    original_filepath
                    .replace('historic_data/', '', 1)
                    .replace('xlsb', 'ftr')
                )

                source = 'excel'

            # Update model with source
            historic_data_instance.source = source
            historic_data_instance.save(update_fields=['source'])
            
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

            # If excel model, now generate Prophet models
            # Easier to happen now rather than earlier because of the way the 
            # prophet models function is written
            if historic_data_instance.source == "excel":
                generate_prophet_models(session_id = user_session, 
                                        data_source=historic_data_instance.source) 

            # Tidy up by deleting the originally-uploaded csv
            if historic_data_instance.source == "record_csv":
                log.info(f'original filepath: {original_filepath}')
                try:
                    if os.path.isfile(f'uploads/{original_filepath}'):
                        os.remove(f'uploads/{original_filepath}')
                        log.info('csv file deleted')
                except:
                    log.error("Couldn't remove original csv file")

            return Response(historic_data_serializer.data, 
                            status=status.HTTP_201_CREATED)
        else:
            log.error('error', historic_data_serializer.errors)
            return Response(historic_data_serializer.errors, 
                            status=status.HTTP_400_BAD_REQUEST)
   

class FilterByColsAndOverwriteData(APIView):
    def post(self, request, *args, **kwargs):

        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()

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

        # Then add stream models
        add_stream_models(df=filtered_df, user_session=uploader)
        # for i, stream in enumerate(filtered_df['stream'].unique()):
        #     stream_data = {'user_session': uploader,
        #                    'stream_name': stream,
        #                    # i + 1 so that priority starts at 1, not 0
        #                    'stream_priority': i+1}
            
        #     stream_serializer = StreamSerializer(data=stream_data)

        #     if stream_serializer.is_valid():
        #         stream_serializer.save()

            # Stream(user_session=uploader,
            #        stream_name=stream,
            #        stream_priority=i).save()


        log.info('Successfully added stream objects to database')

        # Set the prophet models to start generating 
        generate_prophet_models(session_id = uploader, data_source=historic_data.source)

        
        return Response({'Message': 'Successfully processed data'}, 
                        status=status.HTTP_200_OK)


class SessionHasHistoricData(APIView):
    '''
    Checks whether there is historic data associated with a user's session
    and returns a boolean response
    '''
    def get(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)

        if len(queryset) >= 1:
            return Response({'result': True}, status=status.HTTP_200_OK)
        else:
            return Response({'result': False}, status=status.HTTP_200_OK)

class SessionDataProcessed(APIView):
    '''
    Checks whether there is historic data associated with a user's session
    and, if so, whether this data has finished processing in the background
    '''
    def get(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)

        if len(queryset) >= 1:
            historic_data = queryset.last()
            return Response({'result': historic_data.processing_complete}, 
                            status=status.HTTP_200_OK)
        else:
            return Response({'result': False}, 
                            status=status.HTTP_200_OK)

class DeleteSessionHistoricData(APIView):
    '''
    On POST, deletes historic data associated with the user's session
    from both the database and the file system
    '''
    def post(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
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

        def deletion_attempt(filepath):
            log.info(f'Filepath: {filepath}')
            if os.path.isfile(f'uploads/{filepath}'):
                for i in range(3):
                    try: 
                        os.remove(f'uploads/{filepath}')
                        log.info(f'uploads/{filepath} deleted')
                    except PermissionError:
                        log.error(f'Permission error: retrying in 1s')
                        time.sleep(1)
                    except FileNotFoundError:
                        log.error(f'Filepath uploads/{filepath} appears to be invalid. Skipping.')
                    else:
                        log.info(f'Unable to delete uploads/{filepath} after 3 attempts. Will clear up on next scheduled cleanup cycle.')

        deletion_attempt(filepath)

        # Delete stream objects
        Stream.objects.filter(user_session=uploader).delete()
        log.info("Stream data deleted from database")

        # Delete prophet models
        ProphetModel.objects.filter(user_session=uploader).delete()
        log.info("Prophet models deleted from database")

        # Delete prophet forecasts
        # First get the filepaths
        forecast_queryset = ProphetForecast.objects.filter(user_session=uploader)
        forecast_filepaths = []
        # Get the filepath
        for forecast in forecast_queryset:
            forecast_filepaths.append(forecast.prophet_forecast_df_feather.name)
    
        # Now delete the database entries
        ProphetForecast.objects.filter(user_session=uploader).delete()
        log.info("Prophet forecasts deleted from database")
        
        # Now delete the files
        for filepath in forecast_filepaths:
            deletion_attempt(filepath)



        return Response({'result': 'Session data deleted'}, 
                        status=status.HTTP_200_OK)



class GetSessionHistoricDataColumnNames(APIView):
    '''
    Return column names found in uploaded historic data as a list
    '''
    def get(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        uploader = request.session.session_key
        # log.info(request.session.session_key)
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()

        df = pd.read_feather(historic_data.uploaded_data)
        log.info(df.columns)

        # Get rid of a column which gets accidentally generated
        # Plus some behind-the-scenes columns
        for colname in ["Unnamed: 0", "dummy_row", "date", "hour"]:
            if colname in df.columns:
                df = df.drop(colname, axis=1)
        log.info(df.columns)

        return Response({'columns': df.columns}, 
                        status=status.HTTP_200_OK)

class GetSessionStreams(APIView):
    '''
    Return ED streams found in uploaded historic data as a list
    '''
    def get(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()

        df = pd.read_feather(historic_data.uploaded_data)

        return Response({'streams': df.stream.unique()}, 
                        status=status.HTTP_200_OK)


class GetSessionStreamsFromDatabase(APIView):
    '''
    Return ED streams that have been saved to the database
    (will include priority and )
    '''
    def get(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        user_session_key = request.session.session_key
        queryset = Stream.objects.filter(user_session=user_session_key)
        serializer = StreamSerializer(queryset, many=True)
        return Response(serializer.data, 
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
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        uploader = request.session.session_key
        log.info(request.session.session_key)
        queryset = HistoricData.objects.filter(uploader_session=uploader)

        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()

        return Response(UploadedHistoricDataSerializer(historic_data, 
                                                    many=False).data, status=status.HTTP_200_OK)

class MostRecentAsPandas(PandasSimpleView):
    def get_data(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        historic_data = queryset.last()
        return pd.read_feather(historic_data.uploaded_data)

class MostRecentAsAgGridJson(APIView):
    def get(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()
        data = pd.read_feather(historic_data.uploaded_data)
        log.info(data.columns)
        for colname in ["Unnamed: 0", "dummy_row", "date", "hour"]:
            if colname in data.columns:
                data = data.drop(colname, axis=1)
        

        return  JsonResponse(data.to_dict(orient='records'), status=status.HTTP_200_OK, safe=False)

class PlotlyTimeSeriesMostRecent(APIView):
    def get(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
        uploader = request.session.session_key
        queryset = HistoricData.objects.filter(uploader_session=uploader)
        # If owner has >1 uploaded data, find the most recent
        historic_data = queryset.last()

        imported = pd.read_feather(historic_data.uploaded_data)
        log.info("Data read")       
        
        # Check whether the data has been imported from Excel
        if historic_data.source == "record_csv":
            date_col = 'datetime'
            pivot_dt = imported.pivot_table(index=date_col, 
                                            columns='stream', 
                                            values='dummy_row', 
                                            aggfunc='count').fillna(0)
            
        elif historic_data.source == "excel":
            # pivot_dt = imported.set_index('Date')
            # date_col = 'Date'
            date_col = 'Date'
            pivot_dt = imported.pivot_table(index=date_col, 
                                            columns='stream', 
                                            values='value', 
                                            aggfunc='sum').fillna(0)

        log.info("Data pivoted")
        
        plotting_df_ms = pivot_dt.resample('MS').sum()[1:-1]
        log.info("Resampling complete")
        
        fig = px.line(data_frame=plotting_df_ms.reset_index(), 
                      x=date_col, 
                      y=plotting_df_ms.columns,
                      labels={date_col: 'Date',
                              'value': 'Number of visits per month',
                              'variable': 'Stream'})

        return Response(fig.to_json(), status=status.HTTP_200_OK)


class NotesView(APIView):
    def get(self, request, *args, **kwargs):
        # If user session doesn't exist, create one
        if not self.request.session.exists(self.request.session.session_key):
             self.request.session.create()
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
            # If user session doesn't exist, create one
            if not self.request.session.exists(self.request.session.session_key):
                self.request.session.create()
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

class StreamUpdate(APIView):
    def patch(self, request, *args, **kwargs):
        # log.info(request.data)
        stream_object_json = request.data['streams']

        for stream in stream_object_json:
            serializer = StreamSerializer(data=stream)
            if serializer.is_valid():
                relevant_stream_queryset = Stream.objects.filter(id=stream['id'])
                for relevant_stream_obj in relevant_stream_queryset:
                    relevant_stream_obj.stream_priority = stream['stream_priority']
                    relevant_stream_obj.time_for_decision = stream['time_for_decision']

                    relevant_stream_obj.save(update_fields=['stream_priority', 'time_for_decision'])
        
        
        return Response({"Message": "Streams updated successfully"}, 
                        status=status.HTTP_200_OK)
            # else:
            #     log.error('error', serializer.errors)
            #     return Response(serializer.errors, 
            #                     status=status.HTTP_400_BAD_REQUEST)