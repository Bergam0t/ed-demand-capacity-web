# Generated by Django 3.2.3 on 2021-07-15 13:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_prophetforecast_prophetmodel'),
    ]

    operations = [
        migrations.AlterField(
            model_name='prophetforecast',
            name='prophet_forecast_df_feather',
            field=models.FileField(blank=True, upload_to='forecasts'),
        ),
    ]
