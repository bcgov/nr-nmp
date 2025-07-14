# Generated manually to fix null constraint issue

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manures', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='manures',
            name='defaultsolidmoisture',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
