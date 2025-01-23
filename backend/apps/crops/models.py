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

class Crops(models.Model):
    id = models.IntegerField(primary_key=True)
    cropname = models.CharField(max_length=100)
    croptypeid = models.IntegerField()
    yieldcd = models.FloatField()
    cropremovalfactornitrogen = models.FloatField()
    cropremovalfactorp2o5 = models.FloatField()
    cropremovalfactork2o = models.FloatField()
    nitrogenrecommendationid = models.IntegerField()
    nitrogenrecommendationpoundperacre = models.FloatField(blank=True, null=True)
    nitrogenrecommendationupperlimitpoundperacre = models.FloatField(blank=True, null=True)
    previouscropcode = models.IntegerField()
    sortnumber = models.IntegerField()
    manureapplicationhistory = models.IntegerField()
    harvestbushelsperton = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'crops'