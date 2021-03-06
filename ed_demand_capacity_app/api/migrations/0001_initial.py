# Generated by Django 3.2.3 on 2021-07-21 17:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='HistoricData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uploaded_data', models.FileField(upload_to='historic_data')),
                ('uploader_session', models.CharField(default='Not recorded', max_length=50)),
                ('uploader_email', models.CharField(default='Not logged in', max_length=150)),
                ('upload_time', models.DateTimeField(auto_now_add=True)),
                ('processing_complete', models.BooleanField(default=False)),
                ('source', models.CharField(default='Not recorded', max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Notes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('notes', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Organisation',
            fields=[
                ('ods_code', models.CharField(max_length=3, primary_key=True, serialize=False, unique=True)),
                ('organisation_name', models.CharField(default='', max_length=250, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='ProphetForecast',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('stream', models.CharField(default='Not recorded', max_length=150)),
                ('prophet_forecast_df_feather', models.FileField(blank=True, upload_to='forecasts')),
            ],
        ),
        migrations.CreateModel(
            name='ProphetModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('stream', models.CharField(default='Not recorded', max_length=150)),
                ('prophet_model_json', models.JSONField()),
            ],
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('role_name', models.CharField(default='', max_length=150)),
                ('decisions_per_hour_per_stream', models.JSONField()),
            ],
        ),
        migrations.CreateModel(
            name='Shift',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('shift_type_name', models.CharField(default='', max_length=150)),
                ('shift_start_time', models.CharField(default='', max_length=50)),
                ('shift_end_time', models.CharField(default='', max_length=50)),
                ('break_1_start', models.CharField(default='', max_length=50)),
                ('break_1_end', models.CharField(default='', max_length=50)),
                ('break_2_start', models.CharField(default='', max_length=50)),
                ('break_2_end', models.CharField(default='', max_length=50)),
                ('break_3_start', models.CharField(default='', max_length=50)),
                ('break_3_end', models.CharField(default='', max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Stream',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_session', models.CharField(default='Not recorded', max_length=50)),
                ('stream_name', models.CharField(default='', max_length=150)),
                ('stream_priority', models.IntegerField(default=1)),
                ('time_for_decision', models.IntegerField(default=30)),
            ],
        ),
        migrations.CreateModel(
            name='Site',
            fields=[
                ('ods_site_code', models.CharField(default='', max_length=4, primary_key=True, serialize=False, unique=True)),
                ('ods_code', models.ForeignKey(default='Unknown', on_delete=django.db.models.deletion.SET_DEFAULT, to='api.organisation')),
            ],
        ),
    ]
