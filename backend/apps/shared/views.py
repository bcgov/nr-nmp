from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import *
from .serializers import *

class SharedViewset(viewsets.ViewSet):

    @action(detail=True, methods=['get'])
    def regions(self, request, regionId=None):
        regions = None
        if regionId == None:
            regions = Regions.objects.all()
        else:
            regions = Regions.objects.filter(id=regionId)
        serializer = RegionsSerializer(regions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def subregions(self, request, regionId=None):
        subregions = None
        if regionId == None:
            subregions = Subregion.objects.all()
        else:
            subregions = Subregion.objects.filter(regionid=regionId)
        serializer = SubregionSerializer(subregions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
