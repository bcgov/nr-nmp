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
    defaultsolidmoisture = models.IntegerField(null=True, blank=True)

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


class Units(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    nutrientcontentunits = models.CharField()
    conversionlbton = models.FloatField()
    nutrientrateunits = models.CharField(max_length=100)
    costunits = models.CharField(max_length=100)
    costapplications = models.CharField(max_length=100)
    dollarunitarea = models.CharField(max_length=100)
    valuematerialunits = models.CharField(max_length=100)
    valuen = models.CharField(max_length=100)
    valuep2o5 = models.CharField(max_length=100)
    valuek2o = models.CharField(max_length=100)
    farmreqdnutrientsstdunitsconversion = models.FloatField()
    farmreqdnutrientsstdunitsareaconversion = models.FloatField()
    solidliquid = models.CharField(max_length=100)

    class Meta:
        managed = True
        db_table = 'units'


class NitrogenMineralization(models.Model):
    id = models.IntegerField(primary_key=True)
    nmineralizationid = models.IntegerField()
    locationid = models.IntegerField()
    name = models.CharField(max_length=100)
    firstyearvalue = models.FloatField()
    longtermvalue = models.FloatField()

    class Meta:
        managed = True
        db_table = 'nitrogen_mineralization'


class AmmoniaRetentions(models.Model):
    id = models.IntegerField(primary_key=True)
    seasonapplicationid = models.IntegerField()
    drymatter = models.IntegerField()
    value = models.FloatField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'ammonia_retentions'

class PreviousYearManureApplications(models.Model):
    id = models.IntegerField(primary_key=True)
    fieldmanureapplicationhistory = models.IntegerField()
    defaultnitrogencredit = models.CharField(max_length=100)
    previousyearmanureaplicationfrequency = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'previous_year_manure_applications'
