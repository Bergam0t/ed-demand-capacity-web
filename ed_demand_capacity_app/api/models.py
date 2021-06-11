from django.db import models
from django.core.validators import MinValueValidator


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