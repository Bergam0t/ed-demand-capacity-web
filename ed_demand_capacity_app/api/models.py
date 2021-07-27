from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext as _

# See accepted answer here for what the different 'on_delete' options do
# https://stackoverflow.com/questions/38388423/what-does-on-delete-do-on-django-models

# Create your models here.
class Organisation(models.Model):
    ods_code = models.CharField(max_length=3, 
                                unique=True, 
                                primary_key=True)
    organisation_name = models.CharField(max_length=250, 
                                         default="", 
                                         unique=True)


class Site(models.Model):
    ods_site_code = models.CharField(max_length=4, 
                                     default="", 
                                     unique=True,
                                     primary_key=True)
    ods_code = models.ForeignKey(Organisation, 
                                 on_delete=models.SET_DEFAULT, 
                                 default='Unknown')


# class EDModel(models.Model):
#     ods_site_code = models.ForeignKey(Site, on_delete=models)
#     model_owner_id = models.ForeignKey(

# class HistoricData(models.Model):
#     ods_site_code = models.ForeignKey(Site, on_delete=models.SET_DEFAULT, default='Unknown')
#     date = models.DateTimeField()
#     stream = models.CharField(max_length=50, default="")
#     start_time = models.TimeField()
#     end_time = models.TimeField()
#     actual = models.BooleanField(default=True)
#     stream_demand = models.IntegerField(validators = [MinValueValidator(0)])

class HistoricData(models.Model):
    uploaded_data = models.FileField(upload_to='historic_data')
    uploader_session = models.CharField(max_length=50, 
                                        default='Not recorded')
    uploader_email = models.CharField(max_length=150, 
                                      default='Not logged in')
    upload_time = models.DateTimeField(auto_now_add=True, 
                                       blank=True)
    processing_complete = models.BooleanField(default=False)
    source =  models.CharField(max_length=20, 
                                        default='Not recorded')
    processing_initialised_at = models.DateTimeField(null=True)


class Shift(models.Model):
    '''
    Model for storing a shift

    To allow a shift to have as many breaks as required, the ShiftBreak table
    links to this one, using the automatically generated shift primary key 
    as the foreign key
    '''
    user_session = models.CharField(max_length=50, 
                                    default='Not recorded')
    
    shift_type_name = models.CharField(max_length=150,
                                        default='')
    
    shift_start_time = models.CharField(max_length=50,
                                        default='')
    shift_end_time = models.CharField(max_length=50,
                                        default='')
    
    break_1_start = models.CharField(max_length=50,
                                        default='')
    break_1_end = models.CharField(max_length=50,
                                        default='')
    break_2_start = models.CharField(max_length=50,
                                        default='')
    break_2_end = models.CharField(max_length=50,
                                        default='')
    break_3_start = models.CharField(max_length=50,
                                        default='')
    break_3_end = models.CharField(max_length=50,
                                        default='')

class Role(models.Model):
    '''
    Model for storing a role

    The role defines the decision-making capabilities of a 
    particular class of decision maker

    e.g. a Role could be 'Consultant majors'

    You may have >1 individual with the same role in an ED
    '''

    user_session = models.CharField(max_length=50, 
                                    default='Not recorded')
    

    role_name = models.CharField(max_length=150,
                                 default='')

    decisions_per_hour_per_stream = models.JSONField()

class Notes(models.Model):
    '''
    Model for storing a shift

    To allow a shift to have as many breaks as required, the ShiftBreak table
    links to this one, using the automatically generated shift primary key 
    as the foreign key
    '''
    user_session = models.CharField(max_length=50, 
                                    default='Not recorded')
    notes = models.TextField(default='')


class ProphetModel(models.Model):
    '''
    Model for storing a json-serialized fitted Prophet model
    '''

    user_session =  models.CharField(max_length=50, 
                                    default='Not recorded')

    stream = models.CharField(max_length=150,
                                    default='Not recorded')

    prophet_model_json = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True, 
                                       null=True)


class ProphetForecast(models.Model):
    
    user_session =  models.CharField(max_length=50, 
                                     default='Not recorded')

    stream = models.CharField(max_length=150,
                              default='Not recorded')

    prophet_forecast_df_feather = models.FileField(upload_to='forecasts', blank=True)

    created_at = models.DateTimeField(auto_now_add=True, 
                                       null=True)


class Stream(models.Model):
    user_session =  models.CharField(max_length=50, 
                                    default='Not recorded')

    stream_name = models.CharField(max_length=150,
                              default='')

    stream_priority = models.IntegerField(default=1)

    time_for_decision = models.IntegerField(default=30)


class RotaEntry(models.Model):
    
    # See https://docs.djangoproject.com/en/3.2/ref/models/fields/
    class ResourceType(models.TextChoices):
        CORE = 'core', _('Core')
        ADHOC = 'ad hoc', _('Ad hoc')

    user_session =  models.CharField(max_length=50, 
                                default='Not recorded')

    # https://docs.djangoproject.com/en/3.2/topics/db/examples/many_to_one/
    role_type = models.ForeignKey(Role, on_delete=models.CASCADE)

    resource_name = models.CharField(max_length=150,
                              default='')

    # week_start = models.DateField(blank=True, null=True)

    # week_end = models.DateField(blank=True, null=True)

    resource_type = models.CharField(max_length=10,
                                     choices=ResourceType.choices,
                                     default=ResourceType.CORE)

    prev_week = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='prev_week', null=True)
    
    monday = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='monday', null=True)

    tuesday = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='tuesday', null=True)

    wednesday = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='wednesday', null=True)

    thursday = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='thursday', null=True)

    friday =  models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='friday', null=True)

    saturday = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='saturday', null=True)

    sunday = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='sunday', null=True)

class AdditionalFactorRequiredCapacity(models.Model):
    user_session =  models.CharField(max_length=50, 
                                     default='Not recorded')

    factor_name = models.CharField(max_length = 200)
    
    percentage_change = models.FloatField()

    increase_or_decrease = models.CharField(max_length = 10)

    all_streams = models.BooleanField()

    stream = models.ForeignKey(Stream, on_delete=models.CASCADE, null=True)

    factor_type = models.CharField(max_length = 200)

    start_date = models.DateField()

    start_time = models.TimeField()

    end_date = models.DateField()

    end_time = models.TimeField()


class AdditionalFactorAvailableCapacity(models.Model):
    user_session =  models.CharField(max_length=50, 
                                     default='Not recorded')

    factor_description = models.CharField(max_length = 200)

    all_streams = models.BooleanField()

    stream = models.ForeignKey(Stream, on_delete=models.CASCADE, null=True)

    percentage_change = models.FloatField()

    increase_or_decrease = models.CharField(max_length = 10)