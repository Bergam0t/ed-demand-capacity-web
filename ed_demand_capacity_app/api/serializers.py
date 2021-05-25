import sys
sys.path.append("..") 
from rest_framework import serializers
from .models import *
from users.models import *

class OrganisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organisation
        fields = ('ods_code', 'organisation_name')