# Generated by Django 3.2.3 on 2021-07-27 09:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_rotaentry_prev_week'),
    ]

    operations = [
        migrations.CreateModel(
            name='AdditionalFactorCapacity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('factor_description', models.CharField(max_length=200)),
                ('percentage_change', models.FloatField()),
                ('increase_or_decrease', models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='AdditionalFactorDemand',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('factor_description', models.CharField(max_length=200)),
                ('percentage_change', models.FloatField()),
                ('increase_or_decrease', models.CharField(max_length=10)),
            ],
        ),
    ]
