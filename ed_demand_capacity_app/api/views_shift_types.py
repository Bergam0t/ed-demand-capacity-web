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
from datetime import datetime, timedelta
from rest_framework.authtoken.models import Token
import plotly.graph_objects as go
import textwrap
from dateutil import parser


# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO)
# Create the logger
log = logging.getLogger(__name__)


class ShiftType:
    def __init__(self,
                 name,
                 start_time,
                 end_time,
                 unavailability_1_start=None,
                 unavailability_1_end=None,
                 unavailability_2_start=None,
                 unavailability_2_end=None,
                 unavailability_3_start=None,
                 unavailability_3_end=None):
        '''
        Params:
        --------

        name: str
            Name of shift type
            (e.g. early, late, all day)

        start_time: str
            Time the shift begins
            Pass in the form HH:MM

        end_time: str
            Time the shift ends
            Pass in the form HH:MM

        unavailability_1_start: str (OPTIONAL)
            Time the first period of unavailability starts
            Pass in the form HH:MM

        unavailability_1_end: str (OPTIONAL)
            Time the first period of unavailability ends
            Pass in the form HH:MM

        unavailability_2_start: str (OPTIONAL)
            Time the second period of unavailability starts
            Pass in the form HH:MM            

        unavailability_2_end: str (OPTIONAL)
            Time the second period of unavailability ends
            Pass in the form HH:MM


        unavailability_3_start: str (OPTIONAL)
            Time the third period of unavailability starts
            Pass in the form HH:MM
            
        unavailability_3_end: str (OPTIONAL)
            Time the third period of unavailability ends
            Pass in the form HH:MM
        '''

        self.name = name
        self.name_plottable = name.replace('_', ' ').title()

        self.start_time = self.try_datetime_parse(start_time)
        self.end_time = self.try_datetime_parse(end_time)

        self.unavailability_1_start = self.try_datetime_parse(unavailability_1_start)
        self.unavailability_1_end = self.try_datetime_parse(unavailability_1_end)

        self.unavailability_2_start = self.try_datetime_parse(unavailability_2_start)
        self.unavailability_2_end = self.try_datetime_parse(unavailability_2_end)

        self.unavailability_3_start = self.try_datetime_parse(unavailability_3_start)
        self.unavailability_3_end = self.try_datetime_parse(unavailability_3_end)

    def try_datetime_parse(self, time_string):
        if time_string not in [None, 'null', ' ']:
            return parser.parse(time_string).time()
        else:
            return None

    def decimal_time(self, time_of_interest):
        requested_time = getattr(self, time_of_interest)
        if requested_time is not None:
            return requested_time.hour + (requested_time.minute/60)
        else:
            return None

    def shift_type_dataframe(self):
        data = {
            'start_time': self.start_time,
            'end_time': self.end_time,
            'unavailability_1_start': self.unavailability_1_start,
            'unavailability_1_end': self.unavailability_1_end,
            'unavailability_2_start': self.unavailability_2_start,
            'unavailability_2_end': self.unavailability_2_end,
            'unavailability_3_start': self.unavailability_3_start,
            'unavailability_3_end': self.unavailability_3_end,
        }
        
        return pd.DataFrame.from_dict(
            data=data, 
            orient='index', 
            columns = [self.name]
            ) 


# Inspired by https://www.youtube.com/watch?v=TmsD8QExZ84

class ViewAllShiftTypesAnonymous(APIView):
    '''
    View for seeing shift types across organisations
    *TODO* Add in an anonymous organisation ID?  
    '''
    def get(self, request, *args, **kwargs):
        shifts = Shift.objects.all()
        serializer = ShiftSerializerAnonymised(shifts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ViewOwnShiftTypes(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = Shift.objects.filter(user_session=uploader)
        serializer = ShiftSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ViewIndividualShiftOwn(APIView):
    def get(self, request, pk, *args, **kwargs):
        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to find other user's shift types
        # (or at least not the full details)
        uploader = request.session.session_key
        queryset = Shift.objects.filter(user_session=uploader)
        single_shift = queryset.objects.get(id=pk)
        serializer = ShiftSerializer(single_shift, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ViewIndividualShiftAnyAnonymous(APIView):
    def get(self, request, pk, *args, **kwargs):
        shift = Shift.objects.get(id=pk)
        serializer = ShiftSerializerAnonymised(shift, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateShiftType(APIView):
    def post(self, request, *args, **kwargs):
        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to find other user's shift types
        # (or at least not the full details)
        log.info(request.data)
        serializer = ShiftSerializer(data=request.data)

        if serializer.is_valid():
            log.info('Serializer valid for submitted shift type')
            # Save the shift type object, but the user session will be the 
            # default value because we haven't passed that from the frontend
            shift_object = serializer.save()
            
            # Add the user's session to the model object
            user_session_key = request.session.session_key
            shift_object.user_session = user_session_key
            shift_object.save(update_fields=['user_session'])
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            log.error('Serializer not valid for submitted shift type')
            return Response({'Message': 'Invalid data passed'}, status=status.HTTP_400_BAD_REQUEST)


class UpdateShiftType(APIView):
    def post(self, request, pk, *args, **kwargs):
        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to update other user's shift types

        uploader = request.session.session_key
        queryset = Shift.objects.filter(user_session=uploader)
        single_shift = queryset.objects.get(id=pk)

        # TODO: Separate these into two different error messages
        if len(single_shift < 1):
            return Response({'Message': 'This shift does not exist or does not belong to your session'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = ShiftSerializer(instance=single_shift, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'Message': 'Invalid data passed'}, status=status.HTTP_400_BAD_REQUEST)


class DeleteShiftType(APIView):
    def post(self, request, pk, *args, **kwargs):
        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to delete other user's shift types

        # First reduce queryset to only shifts owned by the session
        # as don't want users to be able to find other user's shift types
        # (or at least not the full details)
        uploader = request.session.session_key
        queryset = Shift.objects.filter(user_session=uploader)
        single_shift = queryset.get(id=pk)

        # TODO: Separate these into two different error messages
        if single_shift is None:
            return Response({'Message': 'This shift does not exist or does not belong to your session'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        single_shift.delete()

        return Response({'Message': 'Shift Deleted'}, status=status.HTTP_200_OK)






class PlotShiftTypes(APIView):
    def get(self, request, *args, **kwargs):
        uploader = request.session.session_key
        queryset = Shift.objects.filter(user_session=uploader)

        shift_type_list = []

        for shift_object in queryset:
            shift_type_list.append(
                ShiftType(
                    name = shift_object.shift_type_name,
                    start_time = shift_object.shift_start_time,
                    end_time = shift_object.shift_end_time,
                    unavailability_1_start = shift_object.break_1_start,
                    unavailability_1_end = shift_object.break_1_end,
                    unavailability_2_start = shift_object.break_2_start,
                    unavailability_2_end = shift_object.break_2_end,
                    unavailability_3_start = shift_object.break_3_start,
                    unavailability_3_end = shift_object.break_3_end
                )
            )

        fig = go.Figure()

        # Work out how wide the plot needs to be by looking at the number
        # of shift types we have been given 
        plot_width = 3 * (len(shift_type_list)) + 1

        # Generate y axis labels
        timestrings = []
        t = datetime(2021, 1, 1, 0, 0, 0)
        while t < datetime(2021, 1, 2):
            timestrings.append(str(t.strftime('%H:%M')))
            t = t + timedelta(hours=1)
        time_labels = timestrings * 2
        time_labels = time_labels + ["00:00"]

        # Set axes properties
        fig.update_xaxes(range=[0, plot_width], 
                        showgrid=False, 
                        visible=False)
        # Set height of axes
        # Goes below 0 to allow for 
        fig.update_yaxes(range=[-26, 26], 
                        tickvals=list(range(-24, 25, 1)),
                        ticktext= time_labels)

        # --- Begin iterating through shift types --- #
        for i, shift_type in enumerate(shift_type_list):
            
            # Start by dealing with start and end times
            start_time_decimal_shift = shift_type.decimal_time('start_time')
            end_time_decimal_shift = shift_type.decimal_time('end_time')

            # If the start time is before the end time, 
            # implying a shift that doesn't span midnight
            if start_time_decimal_shift < end_time_decimal_shift:
                y0 = start_time_decimal_shift - 24 
                y1 = end_time_decimal_shift - 24
            
            # If the start time is after the end time, implying the 
            # shift spans midnight
            else: 
                y0 = end_time_decimal_shift 
                y1 = start_time_decimal_shift - 24

            fig.add_shape(type="rect",
                x0 = 3*(i+1) - 2,
                x1 = 3*(i+1) , 
                y0 = y0, 
                y1 = y1,
                line = {
                    'color': "RoyalBlue",
                    'width': 2,
                },
                fillcolor = "LightSkyBlue",
                name = shift_type.name
            )

            fig.add_annotation(
                x=3 * (i+1) - 1, 
                y=26,
                text='<br>'.join(textwrap.wrap(shift_type.name_plottable, width=10)),
                showarrow=False,
                yshift=10
                )

            # --- Now deal with break times --- #
            for j in ["unavailability_1", "unavailability_2", "unavailability_3"]:
                # Get the start and end time for the break as a decimal
                start_time_decimal_break = shift_type.decimal_time(f'{j}_start')
                end_time_decimal_break = shift_type.decimal_time(f'{j}_end')

                # Check whether a break is defined
                if (start_time_decimal_break is not None) and (end_time_decimal_break is not None):

                    # Deal with breaks if shift doesn't span midnight
                    if start_time_decimal_shift < end_time_decimal_shift:
                        y0 = start_time_decimal_break - 24 
                        y1 = end_time_decimal_break - 24

                    # Deal with breaks if shift does span midnight
                    else:                     
                        # If break start is bigger than a break end,
                        # implies the break spans midnight
                        if start_time_decimal_break > end_time_decimal_break:
                            y0 = start_time_decimal_break - 24 
                            y1 = end_time_decimal_break 
                        
                        # If start and end time both after midnight
                        elif (start_time_decimal_break < 12) and (end_time_decimal_break < 12):
                            y0 = start_time_decimal_break  
                            y1 = end_time_decimal_break

                        # If start and end time of break both before midnight
                        else: 
                            y0 = start_time_decimal_break - 24
                            y1 = end_time_decimal_break - 24

                    # Plot the rectangle that represents the break
                    fig.add_shape(type="rect",
                        x0 = 3*(i+1) - 2,
                        x1 = 3*(i+1) , 
                        y0 = y0, 
                        y1 = y1,
                        line = {
                            'color': "RoyalBlue",
                            'width': 2,
                        },
                        fillcolor = "LightGrey",
                        name = shift_type.name,
                        # marker_pattern_shape="/", 
                    )

        # Add a line showing midnight between the two days
        fig.add_shape(
            type="line",
            xref="x", yref="y",
            x0=0, x1=plot_width,
            y0=0, y1=0, 
            line={
                'color': "DarkOrange",
                'width': 1,
                'dash': "dash"
            },
        )

        # Resize the plot
        fig.update_layout(
            autosize=False,
            width=600,
            height=800
            )

        
        return Response(fig.to_json(), status=status.HTTP_200_OK)