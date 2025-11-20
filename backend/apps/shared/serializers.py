from rest_framework import serializers

from .models import Regions, Subregion, NitrateCredit


class RegionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Regions
        fields = '__all__'


class SubregionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subregion
        fields = '__all__'


class NitrateCreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = NitrateCredit
        fields = '__all__'
