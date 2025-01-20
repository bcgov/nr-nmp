from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class APIViewSet(viewsets.ViewSet):
    @action(detail=True, methods=['get'])
    def dummy(self, request, pk=None):
        return Response('TEST', status=status.HTTP_200_OK)
