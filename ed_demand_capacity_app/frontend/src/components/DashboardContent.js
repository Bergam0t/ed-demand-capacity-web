// Use this similar to HomePage in the sample app
// Routing code happens here? 
import React, { Component } from "react";
import { 
    BrowserRouter as Router, 
    Switch, 
    Route, 
    Link, 
    Redirect 
} from "react-router-dom";
import GettingStarted from "../pages/GettingStarted"
import HistoricDemandData from "../pages/HistoricDemandData";
import Notes from "../pages/Notes"
import PlaceholderDashboardContent from "./PlaceholderDashboardContent"
import PlotHistoric from "../pages/PlotHistoric"
import SignIn from "../pages/SignIn"
import PlotForecast from "../pages/DisplayForecastDemand"
import Shifts from "../pages/Shifts"
import EDSettings from "../pages/EDSettings"
import Welcome from "../pages/Welcome"
import Rotas from "../pages/Rotas"
import AdditionalFactorsRequiredCapacity from "../pages/AdditionalFactorsRequiredCapacity"
import AdditionalFactorsAvailableCapacity from "../pages/AdditionalFactorsAvailableCapacity"

export default function DashboardContent() {
    return (
                <div>
                <Route exact path='/' component={ Welcome }/>
                <Route path='/getting-started' component={ GettingStarted } />
                <Route path='/notes' component={ Notes } />
                <Route path='/historic-demand' component={ HistoricDemandData } />
                <Route path='/historic-demand-graphs' component={ PlotHistoric } />
                <Route path='/login' component={ SignIn } />
                <Route path='/forecast-demand' component={ PlotForecast } />
                <Route path='/shift-types' component={ Shifts } />
                <Route path='/ed-settings' component={ EDSettings } />
                <Route path='/rotas' component={ Rotas } />
                <Route path='/additional-factors-required-capacity' component={AdditionalFactorsRequiredCapacity } />
                <Route path='/additional-factors-available-capacity' component={ AdditionalFactorsAvailableCapacity } />
                </div>
    );
}