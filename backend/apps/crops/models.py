from django.db import models

class CropTypes(models.Model):
    # Using an auto-incrementing primary key
    crop_id = models.AutoField(primary_key=True)
    # Existing fields
    id = models.IntegerField()
    name = models.CharField(max_length=100)
    covercrop = models.BooleanField()
    crudeproteinrequired = models.BooleanField()
    customcrop = models.BooleanField()
    modifynitrogen = models.BooleanField()
    staticdataversionid = models.IntegerField()

    class Meta:
        managed = True  # Changed to True so Django manages this table
        db_table = 'crop_types'
        unique_together = ['id', 'staticdataversionid']  # Maintaining the composite uniqueness

    def __str__(self):
        return self.name
