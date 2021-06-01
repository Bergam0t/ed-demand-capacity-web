import React, { Component, useState, useEffect } from "react";
import Plot from 'react-plotly.js';
import axios from 'axios';



// export default function PlotHistoric(props) {

//     let [responseData, setResponseData] = useState(''); 

//     useEffect(() => {
//         axios({
//             "method": "GET",
//             "url": "http://localhost:8000/api/most-recently-uploaded-historic-data-plotly-ms",
//           })
//           .then((response) => {
//             setResponseData(response.data)
//             console.log(response.data)
//           })
//           .catch((error) => {
//             console.log(error)
//           })
//     });

//         return (
//         <Plot
//             data={responseData["data"]}
//             layout={ {width: 920, height: 640, title: 'A Fancy Plot'} }
//         />
//         );

//     }

function getPlotData() {
  fetch('/api/most-recently-uploaded-historic-data-plotly-ms')
  // axios({
  //               "method": "GET",
  //               "url": "http://localhost:8000/api/most-recently-uploaded-historic-data-plotly-ms",
  //             })
      .then((response) => response.json())
      .then((mydata) => {
          this.setState({
              data: mydata.data,
          })
          console.log(mydata.data);
      });
}

export default class PlotHistoric extends Component {
    constructor(props) {
      super(props);
      
      this.state = {
        data: [{
                x: [1, 2, 3],
                y: [2, 6, 3],
                type: 'scatter',
                mode: 'lines+markers',
                marker: {color: 'red'},
              },
              {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},], 
        layout: {}, 
        frames: [], 
        config: {}};

      // this.getPlotData = this.getPlotData.bind(this);
    }

    componentDidMount () {
      getPlotData()
    } 
  
    render() {
      console.log(this.state.data)
      return (
        <h6>Yo</h6>
        // <Plot
        //   data={this.state.data}
        // //   layout={this.state.layout}
        //   layout={ {width: 920, height: 640, title: 'A Fancy Plot'} }
        //   frames={this.state.frames}
        //   config={this.state.config}
        //   onInitialized={(figure) => this.setState(figure)}
        //   onUpdate={(figure) => this.setState(figure)}
        // />
      );
    }
  }