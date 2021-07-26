# ed-demand-capacity-web




# Virtual environments
To run the app on Windows, you need to use a conda environment because there is an issue with installing Prophet using pip. 

However, when deploying to Heroku, it is better to use a pip requirements.txt file because this is required by Python and avoids the complication of needing additional buildpacks. 

If you modify the 

## Creating a new environment.yml file after updating packages 
To create an environment.yml file that Windows users can use to run the app locally, first activate the conda environment from the root directory of the project (ed-demand-capacity-web):

```
conda activate ./envs
```
Then run the following command:
```
conda env export > environment.yml
```

## Creating a requirements.txt file
To create a requirements.txt suitable for Pip, first activate the conda environment from the root directory of the project (ed-demand-capacity-web):

```
conda activate ./envs
```

Then run the following command:
```
pip list --format=freeze > requirements.txt
```

## Creating a new pip venv after updating required packages

If on Windows, while in the root directory of the project (ed-demand-capacity-web):

```
python -m venv env_ed_app_pip
env_ed_app_pip\scripts\activate 
pip install -r requirements.txt 
```


# Python version
Using python 3.7.11 leads to a much quicker build time on Heroku because pystan (which is needed for Propht) already has wheels built whereas for python 3.8+ it has to build them from scratch (or something along those lines). 

runtime.txt is used by Heroku to know which version of Python to use.

However, the app was primarily built and tested with Python 3.8.5


# Misc useful things that tripped me up along the way...
- `package.json` must specify `"@material-ui/lab": "4.0.0-alpha.58",` not `"@material-ui/lab": "*",`
- npm install updates the package-lock.json file



# Running the app in a development environment

## Setting up an environment
If you are running on Windows, you will need to be using conda for environment management as there are issues with installing the Facebook Prophet library with pip. 
```
conda env create -f {PATH TO REPO}\ed-demand-capacity-web\environment.yml
```

If you are on Linux, you could instead use the requirements.txt to create a virtual environment if you prefer, and replace the conda commands below with the commands for activating that environment instead.


## Start a development server
In one VS code cmd terminal (not powershell), run
```
conda activate <ENVIRONMENT FROM ENVIRONMENT.YML>
python {PATH TO REPO}\ed-demand-capacity-web\ed_demand_capacity_app\manage.py runserver
```

## Create a process that will manage long-running background tasks
In another VS code terminal (cmd or powershell), run
```
conda activate <ENVIRONMENT FROM ENVIRONMENT.YML>
python {PATH TO REPO}\ed-demand-capacity-web\ed_demand_capacity_app\manage.py process_tasks
```

## Transpile the javascript using webpack
In another VS code terminal (cmd or powershell), run
```
{PATH TO REPO}\ed-demand-capacity-web\ed_demand_capacity_app\frontend npm run dev
```


## Alternative activation method (quicker to type!)

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