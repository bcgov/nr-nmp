from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import FertilizerTypes, FertilizerUnits, Fertilizers
from .serializers import FertilizerTypesSerializer, FertilizerUnitsSerializer, FertilizersSerializer


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
