# ed-demand-capacity-web

This is a prototype of a web-based version of an Excel-based model for modelling demand and capacity for clinical decision making in type 1, 2 and 3 emergency departments. The Excel model can be found [here](https://www.england.nhs.uk/ourwork/demand-and-capacity/models/demand-and-capacity-emergency-department-model/). 

The app is still being worked on. Planned features can be found [here](https://trello.com/b/u80fzOBi).

If you have any questions about the development of the app, please get in touch with Sammi Rosser ([Bergam0t](https://github.com/Bergam0t)) via [Twitter](https://twitter.com/sammi_rosser), or open an issue on the respository. 


## Features in the model as of August 2021

https://user-images.githubusercontent.com/29951987/130359771-6f6c9de3-5255-4145-a696-c9790c26ea9c.mp4



---

# Information for potential collaborators
---

The web app makes use of a Django REST API backend and a React frontend. They work together in the the way described in [this tutorial](https://www.valentinog.com/blog/drf/) and [this video series](https://www.youtube.com/watch?v=6c2NqDyxppU). 

## Virtual environments
To run the app on Windows, you need to use a conda environment because there is an issue with installing Prophet using pip. 

However, when deploying to Heroku, it is better to use a pip requirements.txt file because this is required by Python and avoids the complication of needing additional buildpacks. 

## Creating an environment.yml file 
To create an environment.yml file that Windows users can use to run the app locally, first activate the conda environment from the root directory of the project (ed-demand-capacity-web):

```
conda activate ./envs
```
Then run the following command:
```
conda env export > environment.yml
```

### Creating a requirements.txt file
To create a requirements.txt suitable for Pip, first activate the conda environment from the root directory of the project (ed-demand-capacity-web):

```
conda activate ./envs
```

Then run the following command:
```
pip list --format=freeze > requirements.txt
```

### Creating a new pip venv after updating required packages

If on Windows, while in the root directory of the project (ed-demand-capacity-web):

```
python -m venv env_ed_app_pip
env_ed_app_pip\scripts\activate 
pip install -r requirements.txt 
```

---
## Python version
Using python 3.7.11 leads to a much quicker build time on Heroku because pystan (which is needed for Propht) already has wheels built whereas for python 3.8+ it has to build them from scratch (or something along those lines). 

runtime.txt is used by Heroku to know which version of Python to use.

However, the app was primarily built and tested with Python 3.8.5

---
## Javascript packages
- When updating the packages.json and package-lock.json files, you need to then copy the updated files from ed-demand-capacity-web/ed_demand_capacity_app/frontend to the root (ed-demand-capacity-web). This is because Heroku looks for these files in the root.

## Misc useful things relating to npm package management that tripped me up along the way...
- `package.json` must specify `"@material-ui/lab": "4.0.0-alpha.58",` not `"@material-ui/lab": "*",`
- npm install updates the package-lock.json file

---

## Running the app in a development environment

### Setting up an environment
If you are running on Windows, you will need to be using conda for environment management as there are issues with installing the Facebook Prophet library with pip. 
```
conda env create -f {PATH TO REPO}\ed-demand-capacity-web\environment.yml
```

If you are on Linux, you could instead use the requirements.txt to create a virtual environment if you prefer, and replace the conda commands below with the commands for activating that environment instead.


### Changes to make to files before running development server
In ed_demand_capacity_app/ed_demand_capacity_app/settings.py, uncomment the following line:
```
os.environ['DATABASE_URL'] = "postgres://ozdqiskfjtelee:9cffeb67f7e9331ed83c5c04eb26a327b0bc6ab1e8a6768ee1a3fa164678d740@ec2-54-220-35-19.eu-west-1.compute.amazonaws.com:5432/dokmln8i3j7lk"
```

In ed_demand_capacity_app/frontend/webpack.config.js, comment out the following line:
```
entry: '/ed_demand_capacity_app/frontend/src/index.js',
```

#### A note on database connections
In the development server, connection pooling does not occur, so you may reach the 20 connection limit on the Heroku database. 

Once deployed, the use of connection pooling should mean that this does not happen.


### Start a development server
In one VS code cmd terminal (not powershell), run
```
conda activate <ENVIRONMENT FROM ENVIRONMENT.YML>
python {PATH TO REPO}\ed-demand-capacity-web\ed_demand_capacity_app\manage.py runserver
```

### Create a process that will manage long-running background tasks
In another VS code terminal (cmd or powershell), run
```
conda activate <ENVIRONMENT FROM ENVIRONMENT.YML>
python {PATH TO REPO}\ed-demand-capacity-web\ed_demand_capacity_app\manage.py process_tasks
```

### Transpile the javascript using webpack
In another VS code terminal (cmd or powershell), run
```
{PATH TO REPO}\ed-demand-capacity-web\ed_demand_capacity_app\frontend npm run dev
```


### Alternative activation method (quicker to type!)

Open the project in vs code.

Open a terminal. It should automatically begin in the relevant folder.

i.e. `<{PATH TO REPO}>`
e.g. on my machine this is `H:\ed-demand-capacity-web>`


Terminal 1 (cmd):

```
conda activate <ENVIRONMENT FROM ENVIRONMENT.YML>
cd ed_demand_capacity_web
python manage.py runserver
```

(hint: after getting as far as `cd ed` you can press tab and it will autocomplete)

Terminal 2 (cmd):

```
conda activate <ENVIRONMENT FROM ENVIRONMENT.YML>
cd ed_demand_capacity_web
python manage.py process_tasks
```

Terminal 3 (cmd or powershell):

```
cd ed_demand_capacity_web
cd frontend
npm run dev
```

---

## Basic steps for adding a new feature

### Backend

1. Add your database models to ed_demand_capacity_app/api/models.py

2. Perform database migrations using 
```
manage.py makemigrations
manage.py migrate
```
3. Write your API views, either in ed_demand_capacity_app/api/views.py or by creating a file called ed_demand_capacity_app/api/views_{what_your_views_relate_to}.py

4. Create endpoints for your API views in ed_demand_capacity_app/api/urls.py


### Frontend

1. Create a page that will use the data from your views in ed_demand_capacity_app/frontend/src/pages

2. Add frontend urls by adding a line to ed_demand_capacity_app/frontend/src/components/DashboardContent.js
e.g. 
```
import { The page you just created } from "../pages/[Filename of the page you just created]"
<Route path='/{the-url-you-want-users-to-see}' component={ The page you just created } />
```

3. Add navigation to the new page by adding a list item to ed_demand_capacity_app/frontend/src/components/ListItems.js
```
<ListItem button to="/[THE URL YOU DEFINED IN STEP 3]" component = { Link }>
    <ListItemIcon>
        <[ICON OF YOUR CHOICE] />
    </ListItemIcon>
    <ListItemText primary=[TEXT YOU WANT USER TO SEE IN MENU BAR] />
</ListItem>
```

You can choose an icon from any of the ones here: https://material-ui.com/components/material-icons/ 
Make sure to import it and put the import at the top of the file.
You can see the code needed for the import by clicking on the icons on the webpage.


Note that for some reason the menu items are particularly stubborn about not refreshing after you have made changes to them. In addition to using the 'empty cache and hard reload' option, you may need to restart the development server and also stop and restart the `npm run dev` script. 

---

## Tracking problems encountered during development

If you need finer-grained tracking of problems than the basic dev tools can provide, you can create additional log statements.

### Frontend

In any javascript (.js) files, use

```
console.log('Your message or output')
```

If you need this to happen during a return statement, you will need to wrap it in curly braces, i.e.
```
{console.log('Your message or output')}
```

These error messages will then appear in the web console. In Chrome, you view this by right clicking on the page and choosing 'inspect'. In the box that then appears, choose 'Console' from the list of tabs at the top. 

### Backend

In Python (.py) files, use 

```
log.info('Your message or output')
```

or 

```
log.error('Your message or output')
```

In most existing files, logging will have already been imported. If you need to set it up in a new file you have created, add the following to the top of the file.

```
import logging
# Ensure all log messages of INFO level and above get shown
logging.basicConfig(level = logging.INFO)
# Create the logger
log = logging.getLogger(__name__)
```

These error messages will then appear in the terminal you are using to 


If you are trying to debug on Heroku, you can access these Python logs using

```
heroku logs --tail -a ed-demand-capacity-app
```

---

## Heroku deployment troubleshooting

1. Check that the following line in ed_demand_capacity_app/frontend/webpack.config.js is NOT commented out:
```
entry: '/ed_demand_capacity_app/frontend/src/index.js',
```
