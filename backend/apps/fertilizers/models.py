from django.db import models


class FertilizerTypes(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    dryliquid = models.CharField(max_length=100)
    custom = models.BooleanField()

    class Meta:
        managed = True
        db_table = 'fertilizer_types'


class FertilizerUnits(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    dryliquid = models.CharField(max_length=100)
    conversiontoimperialgallonsperacre = models.FloatField()
    farmrequirednutrientsstdunitsconversion = models.FloatField()
    farmrequirednutrientsstdunitsareaconversion = models.FloatField()

    class Meta:
        managed = True
        db_table = 'fertilizer_units'


class Fertilizers(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    dryliquid = models.CharField(max_length=100)
    nitrogen = models.FloatField()
    phosphorous = models.FloatField()
    potassium = models.FloatField()
    sortnum = models.FloatField()

    class Meta:
        managed = True
        db_table = 'fertilizers'

class LiquidFertilizerDensities(models.Model):
    id = models.IntegerField(primary_key=True)
    fertilizerid = models.IntegerField()
    densityunitid = models.IntegerField()
    value = models.FloatField()

    class Meta:
        managed = True
        db_table = 'liquid_fertilizer_densities'
