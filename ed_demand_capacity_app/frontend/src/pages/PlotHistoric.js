/* global Plotly:true */

import React, { Component, useState, useEffect } from "react";
// import Plot from 'react-plotly.js';

import createPlotlyComponent from 'react-plotly.js/factory'
import CircularProgress from '@material-ui/core/CircularProgress';

const Plot = createPlotlyComponent(Plotly);

export default class PlotHistoric extends Component {
  constructor(props) {
    super(props);

    const defaultPlotJSON = {
        data: [],
        layout: {
            plotBackground: '#f3f6fa',
            margin: {t:0, r: 0, l: 20, b: 30},
          }
      };

    this.state = {
        json: defaultPlotJSON,
        loaded: false
    };
  }

  componentDidMount () { 
    fetch('/api/most-recently-uploaded-historic-data-plotly-ms')
        .then((response) => {
            return response.json();
            
        })
        
        .then((data) => {
          // It's necessary to use the next line as for some reason
          // the server is returning a json-like object rather than
          // a valid json
          var fixedJson = $.parseJSON(data);
            this.setState({
              json: fixedJson,
              loaded: true
            });
          // console.log(data)
  });
}

  render() {
    if (!this.state.loaded) {
      return (
        <CircularProgress />
      );
    } else {
      return (           <div>
      <Plot
          data={this.state.json.data}
          layout={this.state.json.layout}
      />
      {console.log(this.state.json)}
  </div>    );
      
    }
  }
}