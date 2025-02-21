from django.db import models

class SolidMaterialsConversionFactors(models.Model):
    id = models.IntegerField(primary_key=True)
    inputunit = models.IntegerField()
    inputunitname = models.CharField(max_length=100)
    cubicyardsoutput = models.CharField(max_length=100)
    cubicmetersoutput = models.CharField(max_length=100)
    metrictonsoutput = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'solid_materials_conversion_factors'
