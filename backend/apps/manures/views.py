from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import (
    Manures, SolidMaterialsConversionFactors, LiquidMaterialsConversionFactors,
    Units, NitrogenMineralization, AmmoniaRetentions, PreviousYearManureApplications
)
from .serializers import (
    ManuresSerializer, SolidMaterialsConversionFactorsSerializer,
    LiquidMaterialsConversionFactorsSerializer,
    UnitsSerializer, NMineralizationSerializer,
    AmmoniaRetentionSerializer, PreviousYearManureApplicationsSerializer
)


class ManuresViewset(viewsets.ViewSet):

    @action(detail=True, methods=['get'])
    def manures(self, request, pk=None):
        manures = Manures.objects.all()
        serializer = ManuresSerializer(manures, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def manure(self, request, pk=None):
        manure = get_object_or_404(Manures, pk=pk)
        serializer = ManuresSerializer(manure)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def solidMaterialsConversionFactors(self, request):
        solid_materials_conversion_factors = SolidMaterialsConversionFactors.objects.all()
        serializer = SolidMaterialsConversionFactorsSerializer(solid_materials_conversion_factors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def liquidMaterialsConversionFactors(self, request):
        liquid_materials_conversion_factors = LiquidMaterialsConversionFactors.objects.all()
        serializer = LiquidMaterialsConversionFactorsSerializer(liquid_materials_conversion_factors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def units(self, request, unit=None):
        units = None
        if unit is None:
            units = Units.objects.all()
        else:
            units = Units.objects.filter(name=unit)
        serializer = UnitsSerializer(units, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def nMineralizations(self, request, nMineralization=None, location=None):
        n_mineralizations = None
        if nMineralization is None or location is None:
            n_mineralizations = NitrogenMineralization.objects.all()
        else:
            n_mineralizations = NitrogenMineralization.objects.filter(
                nmineralizationid=nMineralization, locationid=location
            )
        serializer = NMineralizationSerializer(n_mineralizations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def ammoniaRetentions(self, request, seasonApplication=None, dryMatter=None):
        ammonia_retentions = None
        if seasonApplication is None or dryMatter is None:
            ammonia_retentions = AmmoniaRetentions.objects.all()
        else:
            ammonia_retentions = AmmoniaRetentions.objects.filter(
                seasonapplicationid=seasonApplication, drymatter=dryMatter
            )
        serializer = AmmoniaRetentionSerializer(ammonia_retentions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def previousYearManureApplications(self, request, pk=None):
        applications = PreviousYearManureApplications.objects.all()
        serializer = PreviousYearManureApplicationsSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
