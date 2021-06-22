import React, { Component } from 'react';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import CircularProgress from '@material-ui/core/CircularProgress';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';


export default class DisplayExistingData extends Component {

    constructor(props) {
        super(props);

        this.fetchData = this.fetchData.bind(this);
        this.fetchColumnList();

        this.state = {
            json: null,
            loaded: false,
            allDataframeColumnsList: null,
        };

    }

    fetchData() {
        const loggedIn = localStorage.getItem('access_token') ? true : false

        if (loggedIn) {
        return fetch(this.props.api_url, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        }) } else {
            return fetch(this.props.api_url)
        }
    };



    getHeadersColSelectRequest() {
        const loggedIn = localStorage.getItem('access_token') ? true : false
        
        if (loggedIn) {
            return  {
                'content-type': 'application/json',
                'authorization': `JWT ${localStorage.getItem('access_token')}`
              }
        } else {
            return  {
                'content-type': 'application/json'
              }
        }};

    fetchColumnList() {
        return fetch('api/get-historic-data-columns')
            // Make sure to not wrap this first then statement in {}
            // otherwise it returns a promise instead of the json
            // and then you can't access the email attribute 
            .then(response => 
                response.json()
            )
            .then((json) => {
                return json["columns"];
            });
    }
    

    // Runs when component is loaded
    componentDidMount () { 
        this.fetchData()
       .then((result) => {return result.json();})
       .then((data) => {
            this.setState({
                  json: data,
                  loaded: true
                })
            }
        )
        .then(() => {
            this.fetchColumnList()            
            .then((data) => {
                // It's necessary to use the next line as for some reason
                // the server is returning a json-like object rather than
                // a valid json
                  this.setState({
                    allDataframeColumnsList: data.map(data => ({label:data, value:data})),
                    // existing_data_check_complete: true,
                  });
            });
        });
    };


    render() {
        if (!this.state.loaded) {
            return (
              <CircularProgress />
            );
          } else {
            return (
                <div className="ag-theme-alpine" style={{height: 800, width: 1000}}>
                    <AgGridReact
                        rowData={this.state.json}
                    >
                        {(this.state.allDataframeColumnsList || []).map((colName) => {
         return <AgGridColumn field={colName.value} />
      })}
                    </AgGridReact>
                </div>
            );
          }
        }
    };
