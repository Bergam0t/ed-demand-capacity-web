# Generated by Django 3.2.3 on 2021-07-21 14:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_historicdata_processing_complete'),
    ]

    operations = [
        migrations.AddField(
            model_name='historicdata',
            name='source',
            field=models.CharField(default='Not recorded', max_length=20),
        ),
    ]
