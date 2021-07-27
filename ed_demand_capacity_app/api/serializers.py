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
        fields = ('__all__')

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


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


class StreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stream
        fields = '__all__'


class RotaEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = RotaEntry
        fields = '__all__'

class RotaEntrySerializerView(serializers.ModelSerializer):
    prev_week = ShiftSerializer()
    monday = ShiftSerializer()
    tuesday = ShiftSerializer()
    wednesday = ShiftSerializer()
    thursday = ShiftSerializer()
    friday = ShiftSerializer()
    saturday = ShiftSerializer()
    sunday = ShiftSerializer()

    role_type = RoleSerializer()

    class Meta:
        model = RotaEntry
        fields = '__all__'

class AdditionalFactorRequiredCapacitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditionalFactorRequiredCapacity
        fields = '__all__'

class AdditionalFactorAvailableCapacitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditionalFactorAvailableCapacity
        fields = '__all__'