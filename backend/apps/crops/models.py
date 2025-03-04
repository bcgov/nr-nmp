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

class PreviousCropTypes(models.Model):
    id = models.IntegerField()
    previouscropcode = models.IntegerField()
    name = models.CharField(max_length=100)
    nitrogencreditmetric = models.IntegerField()
    nitrogencreditimperial = models.IntegerField()
    cropid = models.IntegerField()
    croptypeid = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'previous_crop_types'

class CropSoilTestPhosphorousRegions(models.Model):
    id = models.IntegerField(primary_key=True)
    cropid = models.IntegerField()
    soiltestphosphorousregioncode = models.IntegerField()
    phosphorouscropgroupregioncode = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'crop_soil_test_phosphorous_regions'

class SoilTestPhosphorousRecommendation(models.Model):
    id = models.IntegerField(primary_key=True)
    soiltestphosphorouskelownarangeid = models.IntegerField()
    soiltestphosphorousregioncode = models.FloatField()
    phosphorouscropgroupregioncode = models.FloatField()
    p2o5recommendationkilogramperhectare = models.FloatField()

    class Meta:
        managed = False
        db_table = 'soil_test_phosphorous_recommendation'

class SoilTestPhosphorousKelownaRanges(models.Model):
    id = models.IntegerField(primary_key=True)
    rangelow = models.IntegerField()
    rangehigh = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'soil_test_phosphorous_kelowna_ranges'

class SoilTestMethods(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    converttokelownaphlessthan72 = models.FloatField()
    converttokelownaphgreaterthan72 = models.FloatField()
    converttokelownak = models.FloatField()
    sortnum = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'soil_test_methods'

class ConversionFactors(models.Model):
    id = models.IntegerField(primary_key=True)
    nitrogenproteinconversion = models.FloatField()
    unitconversion = models.FloatField()
    defaultsoiltestkelownaphosphorous = models.FloatField()
    defaultsoiltestkelownapotassium = models.FloatField()
    kilogramperhectaretopoundperacreconversion = models.FloatField()
    potassiumavailabilityfirstyear = models.FloatField()
    potassiumavailabilitylongterm = models.FloatField()
    potassiumktok2oconversion = models.FloatField()
    phosphorousavailabilityfirstyear = models.FloatField()
    phosphorousavailabilitylongterm = models.FloatField()
    phosphorousptop2o5conversion = models.FloatField()
    poundpertonconversion = models.FloatField()
    poundper1000ftsquaredtopoundperacreconversion = models.FloatField()
    defaultapplicationofmanureinprevyears = models.FloatField()
    soiltestppmtopoundperacreconversion = models.FloatField()

    class Meta:
        managed = False
        db_table = 'conversion_factors'

class SoilTestPotassiumKelownaRanges(models.Model):
    id = models.IntegerField(primary_key=True)
    rangelow = models.IntegerField()
    rangehigh = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'soil_test_potassium_kelowna_ranges'


class SoilTestPotassiumRecommendation(models.Model):
    id = models.IntegerField(primary_key=True)
    soiltestpotassiumkelownarangeid = models.IntegerField()
    soiltestpotassiumregioncode = models.FloatField()
    potassiumcropgroupregioncode = models.FloatField()
    k2orecommendationkilogramperhectare = models.FloatField()

    class Meta:
        managed = False
        db_table = 'soil_test_potassium_recommendation'

class CropSoilPotassiumRegions(models.Model):
    id = models.IntegerField(primary_key=True)
    cropid = models.IntegerField()
    soiltestpotassiumregioncode = models.IntegerField()
    potassiumcropgroupregioncode = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'crop_soil_potassium_regions'
