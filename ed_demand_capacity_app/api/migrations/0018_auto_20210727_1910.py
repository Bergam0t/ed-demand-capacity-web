# Generated by Django 3.2.3 on 2021-07-27 18:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_auto_20210727_1903'),
    ]

    operations = [
        migrations.AlterField(
            model_name='additionalfactorrequiredcapacity',
            name='end_time',
            field=models.CharField(default='', max_length=50),
        ),
        migrations.AlterField(
            model_name='additionalfactorrequiredcapacity',
            name='start_time',
            field=models.CharField(default='', max_length=50),
        ),
    ]