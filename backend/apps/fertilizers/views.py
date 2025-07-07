from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import FertilizerTypes, FertilizerUnits, Fertilizers, LiquidFertilizerDensities
from .serializers import FertilizerTypesSerializer, FertilizerUnitsSerializer, FertilizersSerializer, LiquidFertilizerDensitiesSerializer


class FertilizersViewset(viewsets.ViewSet):

    @action(detail=True, methods=['get'])
    def fertilizerTypes(self, request):
        fertilizer_types = FertilizerTypes.objects.all()
        serializer = FertilizerTypesSerializer(fertilizer_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def fertilizerUnits(self, request):
        fertilizer_units = FertilizerUnits.objects.all()
        serializer = FertilizerUnitsSerializer(fertilizer_units, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def fertilizers(self, request, pk=None):
        fertilizers = Fertilizers.objects.all()
        serializer = FertilizersSerializer(fertilizers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def liquidFertilizerDensities(self, request, pk=None):
        liquid_fertilizer_densities = LiquidFertilizerDensities.objects.all()
        serializer = LiquidFertilizerDensitiesSerializer(liquid_fertilizer_densities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        # return Response({'test': 'test'}, status=status.HTTP_200_OK)

