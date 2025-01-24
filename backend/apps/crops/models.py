from django.db import models

class CropTypes(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    covercrop = models.BooleanField()
    crudeproteinrequired = models.BooleanField()
    customcrop = models.BooleanField()
    modifynitrogen = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'crop_types'
