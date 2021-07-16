import React, { Component} from "react";
import PlotlyPlot from "../components/PlotlyPlot" 
import Typography from '@material-ui/core/Typography';

export default class PlotForecast extends Component {
    render() {
        return (
        <div>
        <Typography variant = "h5"> Monthly Arrivals by Stream </Typography>
        <PlotlyPlot api_url="/api/most-recently-uploaded-historic-data-plotly-ms" />
        </div>
        )
    }
};