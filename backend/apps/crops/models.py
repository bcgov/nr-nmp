from django.db import models

class CropTypes(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    covercrop = models.BooleanField()
    crudeproteinrequired = models.BooleanField()
    customcrop = models.BooleanField()
    modifynitrogen = models.BooleanField()

    class Meta:
        managed = True
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
        managed = True
        db_table = 'crops'

# New model that will be managed by Django ORM
class YieldFactor(models.Model):
    crop = models.ForeignKey(Crops, on_delete=models.CASCADE, related_name='yield_factors')
    region = models.CharField(max_length=100)
    yield_value = models.FloatField(help_text="Yield factor value for the crop in this region")
    unit = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.crop.cropname} - {self.region}: {self.yield_value} {self.unit}"
