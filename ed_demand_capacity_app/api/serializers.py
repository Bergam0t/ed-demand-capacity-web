import sys
sys.path.append("..") 
from rest_framework import serializers
from .models import *
from users.models import *

class OrganisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organisation
        fields = ('ods_code', 'organisation_name')

class UploadedHistoricDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricData
        fields = ('uploaded_data', 'upload_time', 'uploader_session', 'uploader_email')

# See https://stackoverflow.com/questions/45532965/django-rest-framework-serializer-without-a-model
class ColumnSelectSerializer(serializers.Serializer):
    datetime_column = serializers.CharField()
    stream_column = serializers.CharField()

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'


class ShiftSerializerAnonymised(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ('shift_start_time', 'shift_end_time')

class NotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notes
        fields = ('notes', )

class ProphetModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProphetModel
        fields = '__all__'

class ProphetForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProphetForecast 
        fields = '__all__'      