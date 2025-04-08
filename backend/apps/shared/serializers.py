from rest_framework import serializers

from .models import *


class RegionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Regions
        fields = '__all__'


class SubregionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subregion
        fields = '__all__'
