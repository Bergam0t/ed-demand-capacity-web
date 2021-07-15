import React, { Component} from "react";
import PlotlyPlot from "../components/PlotlyPlot" 
// import DisplayExistingData from "../components/LoadedExistingDataset"
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';


export default class PlotForecast extends Component {
    
    constructor(props) {
        super(props);
            this.fetchStreamList = this.fetchStreamList.bind(this);
            this.renderStreamList = this.renderStreamList.bind(this);
            this.renderPlotly = this.renderPlotly.bind(this);
            // this.handleChangeSelectedStream = this.handleChangeSelectedStream.bind(this);
    }

    state = {
        streamList: null,
        streamSelected: null,
        apiRequestURL: null
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
            );
        }

    renderStreamList() {
        if (this.state.streamList) {
            return this.state.streamList.map(data => ({label:data, value:data}));
        } else {
            return [{label:"No streams retrieved", value:"No streams retrieved"}];
        }
    }

    renderPlotly() {
        if (this.state.apiRequestURL) {
            return (
            <PlotlyPlot api_url={this.state.apiRequestURL} />
            )} else {
                return (
                    <Typography variant="h5"> Select a stream to display the forecast</Typography>
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
        
        <Select
            labelId="select-stream-label"
            id="select-stream"
            value={this.state.streamSelected}
            onChange={this.handleChangeSelectedStream}
        >
        {(this.state.streamList || []).map((streamName) => {
         return <MenuItem key={streamName.value} value={streamName.value}>{streamName.label}</MenuItem>
      })}
      </Select>
        
        {this.renderPlotly()}

        </div>
        )
    }
};