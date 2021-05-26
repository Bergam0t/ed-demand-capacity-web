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

export default function DashboardContent() {
    return (
                <div>
                <Route exact path='/' component={ PlaceholderDashboardContent }/>
                <Route path='/getting-started' component={ GettingStarted } />
                <Route path='/notes' component={ Notes } />
                <Route path='/historic-demand' component={ HistoricDemandData } />
                </div>
    );
}