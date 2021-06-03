/* global Plotly:true */

import React, { Component, useState, useEffect } from "react";
// import Plot from 'react-plotly.js';
import axios from 'axios';

import createPlotlyComponent from 'react-plotly.js/factory'
import CircularProgress from '@material-ui/core/CircularProgress';



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

// function getPlotData() {
//   fetch('/api/most-recently-uploaded-historic-data-plotly-ms')
//   // axios({
//   //               "method": "GET",
//   //               "url": "http://localhost:8000/api/most-recently-uploaded-historic-data-plotly-ms",
//   //             })
//       .then((response) => response.json())
//       .then((mydata) => {
//           this.setState({
//               data: mydata.data,
//           })
//           console.log(mydata.data);
//       });
// }

const Plot = createPlotlyComponent(Plotly);

export default class PlotHistoric extends Component {
  constructor(props) {
    super(props);

    // this.handleJsonChange = this.handleJsonChange.bind(this);    

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

  // handleJsonChange = newJSON => {
  //     this.setState({json: newJSON});
  // }

  // handleNewPlot = option => {
  //     let url = '';
  //     if ('value' in option) {
  //         url = option.value;
  //     }
  //     else if ('target' in option) {
  //         url = option.target.value;
  //         if (url.includes('http')) {
  //             if (!url.includes('.json')) {
  //                 url = url + '.json'
  //             }
  //         }
  //     }

  //     if(url) {
  //         fetch(url)
  //         .then((response) => response.json())
  //         .then((newJSON) => {
  //             if ('layout' in newJSON) {    
  //                 if ('height' in newJSON.layout) {
  //                     newJSON.layout.height = null;
  //                 }
  //                 if ('width' in newJSON.layout) {
  //                     newJSON.layout.width = null;
  //                 }
  //             }
  //             this.setState({
  //                 json: newJSON,
  //                 plotUrl: url
  //             });
  //         });
  //     }
  // }

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
          config={{displayModeBar: false}}
      />
      {console.log(this.state.json)}
  </div>    );
      
    }
  }
}