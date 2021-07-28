# Root

## babel.config.json

Babel deals with converting the newest generation of Javascript code (ES6) into code that can be used on browsers that only support an older version (ES5). This is called transpiling.

This file just deals with the 

The bulk of the contents come from [this tutorial series](https://github.com/techwithtim/Music-Controller-Web-App-Tutorial).

## package.json

A list of the javascript and React packages that are needed for the app.

Will automatically be updated when using the command `npm install [PACKAGE-YOU-ARE-INSTALLING]`

Note that when updating this file, you also need to copy it to the root of the project (ed-demand-capacity-web) as this is where Heroku looks for this. Automation of this step would be appreciated.


## package-lock.json

> package-lock.json is automatically generated for any operations where npm modifies either the node_modules tree, or package.json. It describes the exact tree that was generated, such that subsequent installs are able to generate identical trees, regardless of intermediate dependency updates. - [SOURCE](https://atmos.washington.edu/~nbren12/reports/journal/2018-07-16-NN-conservation/node_modules/npm/html/doc/files/package-lock.json.html)

Will automatically be updated when using the command `npm install [PACKAGE-YOU-ARE-INSTALLING]`

Note that when updating this file, you also need to copy it to the root of the project (ed-demand-capacity-web) as this is where Heroku looks for this. Automation of this step would be appreciated.

## webpack.config.js

Webpack controls compilation of Javascript modules. 

The bulk of the contents come from [this tutorial series](https://github.com/techwithtim/Music-Controller-Web-App-Tutorial).

## Procfile

This is the Procfile that is, in theory, used in the multi Procfile setup in Heroku.

I can't get Heroku to find it, so it's here to be fixed eventually. It is intended to deal with running npm run dev, but this appears to be happening anyway without this procfile getting involved. 


---
---

# SRC

### index.js

The only function of this file is a single line:
`import App from "./components/App";`


### store.js

This is a store for state variables that need to be used across multiple components in the app.

It makes use of the [easy-peasy](https://easy-peasy.vercel.app/) library, which is a wrapper that removes the need for the large amounts of boilerplate code that comes with using a Redux store. Behind the scenes, the store is still a Redux store.  

---

## Components

Generally, the 'components' folder has been used for reusable items that will sit within a page, OR components which form the layout of the app.

The pages folder (see below) has generally been used for storing complete pages that can be navigated to from the side menu bar. 

### App.js
This just defines a few high-level things that need to be propagated throughout the entire app:
- the font choice
- the primary/secondary colours for the colourscheme
- the easy-peasy store

### ContentHolder.js

This is the dashbord layout, defining the menu bar and sidebar. 

It is lightly modified from the template available [here](https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/dashboard/Dashboard.js)
More information about these templates can be found [here](https://material-ui.com/getting-started/templates/)

The template is licenced under the MIT licence, allowing for commercial or private use, modification and distribution.


### DashboardContent.js

This deals with the urls on the frontend. 

It uses the React router to display different components depending on the url that is received.

Sending users to different urls is handled by ListItems.js, which is rendered in the sidebar of ContentHolder.js. 

To make a new React component or page display, use the following template.

```
import YOURCOMPONENT from "../pages/YOURCOMPONENT"
<Route path='/your-url' component={ YOURCOMPONENT } />
```

or, if your React component is in components instead of pages

```
import YOURCOMPONENT from "./YOURCOMPONENT"
<Route path='/your-url' component={ YOURCOMPONENT } />
```

Then, when setting up the navigation in ListItems.js (see below for instructions), make sure to use the same URL. 

### DisplayUserWelcome.js 

This simply displays a welcome message that differs depending on whether the user is logged in. 

### Glossary.js

This displays a glossary.

Additional glossary entries can be added by using the following format and adding it to the appropriate position in the array `rows`.

```
createData('WORD', 
           'DESCRIPTION'),
```

Make sure to enclose your glossary items in single or double quotes.


### ListItems.js

This file defines the menu items that appear in the side bar. 

To add a new menu item, use the following format:

```
<ListItem button to="/[THE URL YOU DEFINED IN DashboardContent.js]" component = { Link }>
    <ListItemIcon>
        <[ICON OF YOUR CHOICE] />
    </ListItemIcon>
    <ListItemText primary=[TEXT YOU WANT USER TO SEE IN MENU BAR] />
</ListItem>
```

You can choose an icon from any of the ones here: https://material-ui.com/components/material-icons/ Make sure to import it and put the import at the top of the file. You can see the code needed for the import by clicking on the icons on the webpage.

Note that for some reason the menu items are particularly stubborn about not refreshing after you have made changes to them. In addition to using the 'empty cache and hard reload' option, you may need to restart the development server and also stop and restart the `npm run dev` script.

### LoadedExistingDataset.js
Render an uploaded dataset with the community version of the [ag-grid library](https://www.ag-grid.com/react-grid/).

The community version of AG Grid is dstributed under the MIT licence and therefore ["is free to use in your production environments"](https://www.ag-grid.com/license-pricing.php).

This component takes the api url for the dataset (in the format required by ag-grid) as a prop. 

However, note that the url for getting the columns from the dataset is currently hardcoded - this will need to be changed if you need to render anything other than the main historical dataset. 

### PlaceholderDashboardContent.js
This is just a component that can be used while setting up navigation. It simply displays the word 'Placeholder', allowing you to check that other aspects of the app are working as you would expect.

### PlotlyPlot.js

This is a reusable component that renders a plotly plot.

An API endpoint should be passed as a prop, where the response from that endpoint is a plotly figure that has been turned into a json using `fig.to_json()`. 

To use the component in a page, you would write something like the below:

```
<PlotlyPlot api_url="/api/most-recently-uploaded-historic-data-plotly-ms" />
```

This endpoint returns a response of the type `application/json` that begins as follows:
```
"{\"data\":[{\"hovertemplate\":\"Stream=Majors<br>Date=%{x}<br>Number of visits per month=%{y}<extra></extra>\",\"legendgroup\":
```


---
## Pages
---

### AdditionalFactorsAvailableCapacity.js *(UNFINISHED, NAVIGATION CURRENTLY DISABLED)*
Page that allows users to enter optional additional factors that will affect their available capacity. 

### AdditionalFactorsRequiredCapacity.js 
Page that allows users to enter optional additional factors that will affect their required capacity (e.g. hot weather, large sporting events). 

### DisplayForecastDemand.js
Page that displays 8 week Prophet forecasts. 

Allows users to select the stream of interest from a dropdown. 

### EDSettings.js
Page that allows users to:
- change the priority order of streams, affecting the order in which flexible capacity will be used
- change the time taken for decisions per stream
- define roles, which determine the number of decisions per hour that can be made by different types of clinical decision maker.

Help videos are also provided in pop-ups for these functions. These videos are trimmed versions of the model walkthrough video that can be found [here](https://www.england.nhs.uk/ourwork/demand-and-capacity/models/demand-and-capacity-emergency-department-model/). 

### GettingStarted.js
Page that provides simple instructions for new users on how to use the app.

### HistoricDemandData.js
Page that allows users to upload historical data, either as:
- an existing completed Excel mode, of the form that is available to download [here](https://www.england.nhs.uk/ourwork/demand-and-capacity/models/demand-and-capacity-emergency-department-model/).
- a csv file containing record format data (one row per patient). The data must contain a datetime column and a stream column, but does not mind if there are additional columns (it will discard them) or if the naming is not obvious (as the user will select the relevant columns from a dropdown)
- **NOT YET IMPLEMENTED** an Excel template, which will just be a slimmed-down version of the model available [here](https://www.england.nhs.uk/ourwork/demand-and-capacity/models/demand-and-capacity-emergency-department-model/). 

### HistoricDemandDataClass.js *(NO LONGER USED)*
The historic demand data page was original written as a class-based component. This is kept here for reference, and potentially for use in a future blog post where I will cover converting class-based components to functional components. 

### Notes.js
Page that allows users to record notes about how they have filled in the app. 

### PlotHistoric.js
Page that renders a graph showing the monthly arrivals per stream for the uploaded historical data.

This could easily be extended to show multiple graphs of the historic data.

### Rotas.js
Page that allows users to create a rota for a one week period. 

Rota entries consistent of a role, an optional resource name (e.g. Dr Y), whether the resource is core or ad-hoc, and what shift pattern the resource will follow on each day.

Users can also specify the period of interest here (e.g. they may be interested in the period that is 6 weeks after the submission of the data as rotas are often made that far in advance). 

### Shifts.js
Page that allows users to define shifts (start, end and up to 3 periods of unavailability). 

Also plots shifts in a format that makes it easier to check whether you have set them up correctly. 

### SignIn.js

It is lightly modified from the template available [here](https://github.com/mui-org/material-ui/tree/master/docs/src/pages/getting-started/templates/sign-in)
More information about these templates can be found [here](https://material-ui.com/getting-started/templates/)

The template is licenced under the MIT licence, allowing for commercial or private use, modification and distribution

### SignUp.js *(NOT CURRENTLY USED)*

It is lightly modified from the template available [here](https://github.com/mui-org/material-ui/tree/master/docs/src/pages/getting-started/templates/sign-up)
More information about these templates can be found [here](https://material-ui.com/getting-started/templates/)

The template is licenced under the MIT licence, allowing for commercial or private use, modification and distribution

### Welcome.js
This is the page that is displayed if users arrive at the root url of the app. 

A page that explains what this app is, provides access to the help video made for the original model (available [here](https://www.england.nhs.uk/ourwork/demand-and-capacity/models/demand-and-capacity-emergency-department-model/)) and helps new users decide where to go first.
