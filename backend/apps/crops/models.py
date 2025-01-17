from django.db import models

class CropTypes(models.Model):
    Name = models.CharField(max_length=100, null=True)
    CoverCrop = models.BooleanField()
    CrudeProteinRequired = models.BooleanField()
    CustomCrop = models.BooleanField()
    ModifyNitrogen = models.BooleanField()

    def __str__(self):
        return f"{self.crop_type}"
