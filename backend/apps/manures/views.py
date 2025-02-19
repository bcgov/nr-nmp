from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import *
from .serializers import *

class ManuresViewset(viewsets.ViewSet):
    
    @action(detail=True, methods=['get'])
    def manures(self, request, pk=None):
        manures = Manures.objects.all()
        serializer = ManuresSerializer(manures, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)