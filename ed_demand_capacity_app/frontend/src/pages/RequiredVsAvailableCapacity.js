import React, { Component} from "react";
import PlotlyPlot from "../components/PlotlyPlot" 
// import DisplayExistingData from "../components/LoadedExistingDataset"
import Typography from '@material-ui/core/Typography';


export default class PlotForecast extends Component {
    render() {
        return (
        <div>
        <Typography variant="h4"> Predicted Demand: Arrivals Per Hour for Next 7 Days</Typography>
        <PlotlyPlot api_url="/api/most-recently-uploaded-data-forecast" />
        {/* // <DisplayExistingData api_url='/api/most-recently-uploaded-ag-grid-json' /> */}
        </div>
        )
    }
};