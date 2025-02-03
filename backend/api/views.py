from rest_framework.response import Response
from rest_framework.decorators import api_view
from crops.models import CropTypes
from .serializers import CropTypesSerializer

@api_view(['GET'])
def crop_types(request):
    cropsTypes = CropTypes.objects.all()
    serializer = CropTypesSerializer(cropsTypes, many=True)
    return Response({serializer.data})
