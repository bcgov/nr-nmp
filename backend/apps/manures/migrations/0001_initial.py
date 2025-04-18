# Generated by Django 5.1.7 on 2025-03-20 18:43

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='LiquidMaterialsConversionFactors',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('inputunit', models.IntegerField()),
                ('inputunitname', models.CharField(max_length=100)),
                ('usgallonsoutput', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'liquid_materials_conversion_factors',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='Manures',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('manureclass', models.CharField(max_length=100)),
                ('solidliquid', models.CharField(max_length=100)),
                ('moisture', models.CharField(max_length=100)),
                ('nitrogen', models.FloatField()),
                ('ammonia', models.FloatField()),
                ('phosphorous', models.FloatField()),
                ('potassium', models.FloatField()),
                ('drymatterid', models.IntegerField()),
                ('nmineralizationid', models.IntegerField()),
                ('sortnum', models.IntegerField()),
                ('cubicyardconversion', models.FloatField()),
                ('nitrate', models.FloatField()),
                ('defaultsolidmoisture', models.IntegerField()),
            ],
            options={
                'db_table': 'manures',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='SolidMaterialsConversionFactors',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('inputunit', models.IntegerField()),
                ('inputunitname', models.CharField(max_length=100)),
                ('cubicyardsoutput', models.CharField(max_length=100)),
                ('cubicmetersoutput', models.CharField(max_length=100)),
                ('metrictonsoutput', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'solid_materials_conversion_factors',
                'managed': True,
            },
        ),
    ]
