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
import PlotForecast from "../pages/RequiredVsAvailableCapacity"
import Shifts from "../pages/Shifts"

export default function DashboardContent() {
    return (
                <div>
                <Route exact path='/' component={ PlaceholderDashboardContent }/>
                <Route path='/getting-started' component={ GettingStarted } />
                <Route path='/notes' component={ Notes } />
                <Route path='/historic-demand' component={ HistoricDemandData } />
                <Route path='/historic-demand-graphs' component={ PlotHistoric } />
                <Route path='/login' component={ SignIn } />
                <Route path='/forecast-demand' component={ PlotForecast } />
                <Route path='/shift-types' component={ Shifts } />
                </div>
    );
}