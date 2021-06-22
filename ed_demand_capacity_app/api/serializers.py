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

class ShiftBreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftBreak
        fields = '__all__'