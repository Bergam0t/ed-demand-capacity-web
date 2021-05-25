from django.db import models

# See accepted answer here for what the different 'on_delete' options do
# https://stackoverflow.com/questions/38388423/what-does-on-delete-do-on-django-models

# Create your models here.
class Organisation(models.Model):
    ods_code = models.CharField(max_length=3, default="", unique=True, primary_key=True)


class Site(models.Model):
    ods_site_code = models.CharField(max_length=4, default="", unique=True, primary_key=True)
    ods_code = models.ForeignKey(Organisation, on_delete=models.SET_NULL)



class EDModel(models.Model):
    ods_site_code = models.ForeignKey(Site, on_delete=models)
    #model_owner_id = 