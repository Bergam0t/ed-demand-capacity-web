# Generated by Django 3.2.3 on 2021-07-28 16:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_auto_20210727_1911'),
    ]

    operations = [
        migrations.AlterField(
            model_name='historicdata',
            name='processing_complete',
            field=models.CharField(default='Not started', max_length=15),
        ),
    ]
