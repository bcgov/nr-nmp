from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Manures, SolidMaterialsConversionFactors, LiquidMaterialsConversionFactors
from .serializers import (
    ManuresSerializer, SolidMaterialsConversionFactorsSerializer,
    LiquidMaterialsConversionFactorsSerializer
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
