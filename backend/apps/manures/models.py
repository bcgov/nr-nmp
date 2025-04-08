from django.db import models


class Manures(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    manureclass = models.CharField(max_length=100)
    solidliquid = models.CharField(max_length=100)
    moisture = models.CharField(max_length=100)
    nitrogen = models.FloatField()
    ammonia = models.FloatField()
    phosphorous = models.FloatField()
    potassium = models.FloatField()
    drymatterid = models.IntegerField()
    nmineralizationid = models.IntegerField()
    sortnum = models.IntegerField()
    cubicyardconversion = models.FloatField()
    nitrate = models.FloatField()
    defaultsolidmoisture = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'manures'


class SolidMaterialsConversionFactors(models.Model):
    id = models.IntegerField(primary_key=True)
    inputunit = models.IntegerField()
    inputunitname = models.CharField(max_length=100)
    cubicyardsoutput = models.CharField(max_length=100)
    cubicmetersoutput = models.CharField(max_length=100)
    metrictonsoutput = models.CharField(max_length=100)

    class Meta:
        managed = True
        db_table = 'solid_materials_conversion_factors'


class LiquidMaterialsConversionFactors(models.Model):
    id = models.IntegerField(primary_key=True)
    inputunit = models.IntegerField()
    inputunitname = models.CharField(max_length=100)
    usgallonsoutput = models.CharField(max_length=100)

    class Meta:
        managed = True
        db_table = 'liquid_materials_conversion_factors'
