import React, { Component} from "react";
import PlotlyPlot from "../components/PlotlyPlot" 
// import DisplayExistingData from "../components/LoadedExistingDataset"

export default class PlotForecast extends Component {
    render() {
        return (
        <PlotlyPlot api_url="/api/most-recently-uploaded-data-forecast" />
        // <DisplayExistingData api_url='/api/most-recently-uploaded-ag-grid-json' />
        )
    }
};