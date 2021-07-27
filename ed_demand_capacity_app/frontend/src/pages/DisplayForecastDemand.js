import React, { Component} from "react";
import PlotlyPlot from "../components/PlotlyPlot" 
// import DisplayExistingData from "../components/LoadedExistingDataset"

import { Typography, Select, MenuItem, Grid } from '@material-ui/core';

// import Typography from '@material-ui/core/Typography';
// import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';


export default class PlotForecast extends Component {
    
    constructor(props) {
        super(props);
            this.fetchStreamList = this.fetchStreamList.bind(this);
            this.renderStreamList = this.renderStreamList.bind(this);
            this.renderPlotly = this.renderPlotly.bind(this);
            this.handleChangeSelectedStream = this.handleChangeSelectedStream.bind(this);
    
            this.state = {
                streamList: null,
                streamSelected: '',
                apiRequestURL: ''
            }
        }


    
    fetchStreamList() {
        return fetch('api/get-historic-data-streams')
            // Make sure to not wrap this first then statement in {}
            // otherwise it returns a promise instead of the json
            // and then you can't access the email attribute 
            .then(response => 
                response.json()
            )
            .then((json) => {
                return json["streams"];
            });
    }

    handleChangeSelectedStream = e => {
        this.setState({
            streamSelected: e.target.value,
            apiRequestURL: "/api/most-recently-uploaded-data-forecast?stream=" + e.target.value}
            ).then(() => this.forceUpdate())
        
        }

    renderStreamList() {
        if (this.state.streamList) {
            return this.state.streamList.map(data => ({label:data, value:data}));
        } else {
            return [{label:"No streams retrieved", value:"No streams retrieved"}];
        }
    }

    renderPlotly() {
        if (this.state.apiRequestURL === '') {
                return (
                    <Typography variant="h6"> 
                        Select a stream from the dropdown above to display the forecast.
                        <br /><br />
                        Please be patient: it may take up to 15 seconds to load the first graph. 
                        If it has not loaded after this time, please refresh the page.
                        </Typography>
                )
            } else {
                return (
                    <div key={this.state.apiRequestURL}>
                    <PlotlyPlot api_url={this.state.apiRequestURL} />
                    </div>
                )
            }
    }

    // Define what happens when the component is first loaded
    componentDidMount () { 
        this.fetchStreamList()
        .then((data) => {
            // It's necessary to use the next line as for some reason
            // the server is returning a json-like object rather than
            // a valid json
              this.setState({
                streamList: data.map(data => ({label:data, value:data})),
                // existing_data_check_complete: true,
              });
            // console.log(data)
          });
    }


    
    render() {
        return (
        <div>
        <Typography variant="h4"> Predicted Demand: Arrivals Per Hour for Next 8 Weeks</Typography>
        <br />  
        <Typography variant="h6"> 
            Here you can view the forecast demand for each stream, and the historical data for the previous year. 
            <br />
            If you put your mouse over the graph, you will see additional controls that will allow you to zoom in.
            <br />  <br />
            The black dots show the historic data points for each hour. <br />
            The dark blue line is the predicted attendances.<br />
            The light blue shading shows the uncertainty - the attendances are expected to be within this range.
            <br />  <br />        
        </Typography>
        <br /> <br />
        <Grid container>
            <Grid item xs={10} med={6} lg={4}>
        <Select
            labelId="select-stream-label"
            id="select-stream"
            value={this.state.streamSelected}
            onChange={this.handleChangeSelectedStream}
            fullWidth
        >
        {(this.state.streamList || []).map((streamName) => {
         return <MenuItem key={streamName.value} value={streamName.value}>{streamName.label}</MenuItem>
      })}
      </Select>
      </Grid>
      </Grid>  
      <br /> <br />  
      
      {this.renderPlotly()}
      

      

        </div>
        )
    }
};