import React, { Component} from "react";
import PlotlyPlot from "../components/PlotlyPlot" 

export default class PlotForecast extends Component {
    render() {
        return (
        <PlotlyPlot api_url="/api/most-recently-uploaded-data-forecast" />
        )
    }
};