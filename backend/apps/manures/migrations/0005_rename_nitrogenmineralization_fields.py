# Generated manually to rename NitrogenMineralization fields to lowercase

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('manures', '0004_nitrogenmineralization'),
    ]

    operations = [
        migrations.RenameField(
            model_name='nitrogenmineralization',
            old_name='Id',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='nitrogenmineralization',
            old_name='LocationId',
            new_name='locationid',
        ),
        migrations.RenameField(
            model_name='nitrogenmineralization',
            old_name='Name',
            new_name='name',
        ),
        migrations.RenameField(
            model_name='nitrogenmineralization',
            old_name='FirstYearValue',
            new_name='firstyearvalue',
        ),
        migrations.RenameField(
            model_name='nitrogenmineralization',
            old_name='LongTermValue',
            new_name='longtermvalue',
        ),
    ]
