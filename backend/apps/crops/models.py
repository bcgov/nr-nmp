from django.db import models

class CropTypes(models.Model):
    # This model errors because it doesn't have a primary key
    # Django tries to treat id as the primary key but it's non-unique
    # Trying to add some fake primary key that doesn't exist in the table also errors
    # This composite key is only supported in an alpha build of Django
    # But even the alpha build doesn't support composite keys on the admin portal
    # pk = models.CompositePrimaryKey('id', 'staticdataversionid')
    id = models.IntegerField()
    name = models.CharField(max_length=100)
    covercrop = models.BooleanField()
    crudeproteinrequired = models.BooleanField()
    customcrop = models.BooleanField()
    modifynitrogen = models.BooleanField()
    staticdataversionid = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'crop_types'
