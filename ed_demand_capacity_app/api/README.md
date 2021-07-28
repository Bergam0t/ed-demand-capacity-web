# forecast_utils.py

## Running forecasts
This file contains Python functions for running the Prophet forecast. 

If you wish to modify Prophet forecasting features (e.g. confidence intervals, holidays included) or store additional data from the prophet forecasting routine (e.g. metrics), this is the place to do it.  

The function defined here is run using django-background-utils, so is a good place to include other long-running calculations that will be performed during the initial data upload step. They have to be defined in this way because Heroku has a 30 second limit for requests. 

## Plotting forecasts
This file also contains a modified version of the plot_plotly command from Prophet.
I added the following parameters:
exclude_history: optional boolean to omit history from the plot
history_as_lines: optional boolean to plot history as a line instead of as marker points
history_to_include: optional timedelta to specify the amount of history to include. Will be ignored if exclude_history == True.

This gives more control over the size/complexity of the plot with large datasets at hourly resolution, which can lead to very slow behaviour if using the standard plot_plotly function.

# models.py

This is where the database models are stored.

If you need to store a new class of data in the SQL database, this is where you will define the table. 


# serializers.py

Serializers act as the interface between querysets and standard Python. 

See [the Django documentation](https://www.django-rest-framework.org/api-guide/serializers/) for a full explanation of their role.

You will need to define one or more serializers for each model class. They will be used to validate any input before an object can be saved into the database.

# urls.py

This defines all urls for the API, allowing views defined to be accessed as Django Rest Framework endpoints.

Any URLs in this file will be accessible by appending them after `/api/` in the address bar. 


# Views

## views.py

This file defines the API views for:
- uploading historical data that is in Excel format
- uploading historical data that is a record-format csv (one row per patient)
- checking whether historical data exists
- checking whether uploaded data has had all processing tasks applied (e.g. Prophet models generated)
- deleting historical data
- getting column names from uploaded data
- getting strams from uploaded data
- getting streams from the database (these objects are generated as part of the processing step)
- displaying the filename of the session's historical data
- displaying the session's historical data as pandas dataframe
- displaying the session's historical data in the form required for consumption by AgGrid
- returning a json of a Plotly plot of historical data, resampled by month
- displaying and editing notes, which can be used to record useful information about the completing of the model
- updating details of streams (priority and time per decision)

## views_additional_factors.py
This file defines the API views for:
### Required Capacity
- creating factors 
- viewing factors associated with a session
- deleting individual factors
### Available Capacity
- creating factors 
- viewing factors associated with a session
- deleting individual factors


## views_forecasting.py
This file defines the API views for:
- returning an array of jsons of Plotly plots showing the Prophet forecast of all streams (array entry = json for one stream)
- return a json of a modified Plotly plot showing the Prophet forecast with only 1 year of history, and only for a single stream

## views_role_types.py
Role types = definition of the number of decisions per hour per stream that can be made by an individual (e.g. a resus consultant). 

This file defines the API views for:
- viewing all role types associated with the user's session
- viewing individual role types associated with the user's session
- creating role types
- deleting individual role types

This also defines a Python Role object and a function for creating these role objects from a Django queryset.

## views_rotas.py
Rota entry = information for a single resource (person) about the role they have and the times they will be working.

This file defines the API views for:
- viewing all rota entries associated with the user's session, with links to other objects (role types, shift types) represented by object IDs
- viewing all rota entries associated with the user's session, with links to other objects (role types, shift types) showing the full object
- viewing individual rota entries associated with the user's session
- creating rota entries
- deleting individual rota entries

This also defines a Python Rota object and a function for creating these role objects from a Django queryset.

## views_scenarios.py
At present, a scenario only describes the start date of the period of interest.
In future it will cover more things (the rota to use, the additional factors to include, etc)

This file defines the API views for:
- creating and updating scenario objects

## views_shift_types.py
Shift types = definition of the start time and end time of a shift, with up to 3 optional periods of unavailability.

This file defines the API views for:
- viewing all shift types associated with the user's session
- viewing individual shift types associated with the user's session
- viewing an anonymised list of all shift types created by all users
- creating shift types
- deleting shift types
- returning a json of a Plotly plot of the shift types associated with the user's session

