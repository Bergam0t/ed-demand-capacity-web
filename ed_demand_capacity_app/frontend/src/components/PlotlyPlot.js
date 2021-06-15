
/* global Plotly:true */

import React, { Component, useState, useEffect } from "react";
// import Plot from 'react-plotly.js';

import createPlotlyComponent from 'react-plotly.js/factory'
import CircularProgress from '@material-ui/core/CircularProgress';
import {useStoreState} from 'easy-peasy';

const Plot = createPlotlyComponent(Plotly);

// const api_url = props => {props.api_url};

export default class PlotlyPlot extends Component {
    constructor(props) {
      super(props);
  
        this.fetchData = this.fetchData.bind(this);

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

    fetchData() {
      const loggedIn = localStorage.getItem('token') ? true : false
  
      if (loggedIn) {
        return fetch(this.props.api_url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }) } else {
          return fetch(this.props.api_url)
        }
    };
  
    componentDidMount () { 
          console.log(this.props.api_url)
          this.fetchData()
  
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

