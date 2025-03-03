from django.db import models

class CropTypes(models.Model):
    name = models.CharField(max_length=100)
    covercrop = models.BooleanField()
    crudeproteinrequired = models.BooleanField()
    customcrop = models.BooleanField()
    modifynitrogen = models.BooleanField()

class Crops(models.Model):
    name = models.CharField(max_length=100)
    crop_type = models.ForeignKey(CropTypes, on_delete=models.CASCADE)
    nitrogen = models.FloatField()
