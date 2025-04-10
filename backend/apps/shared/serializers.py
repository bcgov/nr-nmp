from rest_framework import serializers

from .models import Regions, Subregion


class RegionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Regions
        fields = '__all__'


class SubregionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subregion
        fields = '__all__'
