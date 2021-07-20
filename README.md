# ed-demand-capacity-web




# Virtual environments
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

## Creating a requirements.txt file
To create a requirements.txt suitable for Pip, first activate the conda environment from the root directory of the project (ed-demand-capacity-web):

```
conda activate ./envs
```

Then run the following command:
```
pip list --format=freeze > requirements.txt
```

## Creating a pip venv

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


# Misc useful things
- `package.json` must specify `"@material-ui/lab": "4.0.0-alpha.58",` not `"@material-ui/lab": "*",`
- npm install updates the package-lock.json file



# Running the app in a development environment

In one VS code cmd terminal (not powershell), run
```
conda activate ./envs
{PATH TO REPO}\ed-demand-capacity-web\ed_demand_capacity_app> python .\manage.py runserver
```

In another VS code terminal (cmd or powershell), run
```
{PATH TO REPO}\ed-demand-capacity-web\ed_demand_capacity_app\frontend> npm run dev
```


## Alternative 

Open the project in vs code.

Open a terminal. It should automatically begin in the relevant folder.

i.e. `<{PATH TO REPO}>`
e.g. on my machine this is `H:\ed-demand-capacity-web>`


Terminal 1 (cmd):

```
conda activate ./envs
cd ed_demand_capacity_web
python ./manage.py runserver
```

(hint: after getting as far as `cd ed` you can press tab and it will autocomplete)

Terminal 2 (cmd or powershell):

```
cd ed_demand_capacity_web
cd frontend
npm run dev
```