from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Regions, Subregion, NitrateCredit
from .serializers import RegionsSerializer, SubregionSerializer, NitrateCreditSerializer


class SharedViewset(viewsets.ViewSet):

    @action(detail=True, methods=['get'])
    def regions(self, request, regionId=None):
        regions = None
        if regionId is None:
            regions = Regions.objects.all()
        else:
            regions = Regions.objects.filter(id=regionId)
        serializer = RegionsSerializer(regions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def subregions(self, request, regionId=None, subregionId=None):
        subregions = None
        if regionId is None:
            subregions = Subregion.objects.all()
        elif subregionId is None:
            subregions = Subregion.objects.filter(regionid=regionId)
        else:
            subregions = Subregion.objects.filter(regionid=regionId, id=subregionId)
        serializer = SubregionSerializer(subregions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def nitratecredit(self, request):
        serializer = NitrateCreditSerializer(NitrateCredit.objects.all(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
