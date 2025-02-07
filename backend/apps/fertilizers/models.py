from django.db import models

class FertilizerTypes(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    dryliquid = models.CharField(max_length=100)
    custom = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'fertilizer_types'

class Fertilizers(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    dryliquid = models.CharField(max_length=100)
    nitrogen = models.FloatField()
    phosphorous = models.FloatField()
    potassium = models.FloatField()
    sortnum = models.FloatField()

    class Meta:
        managed = False
        db_table = 'fertilizers'