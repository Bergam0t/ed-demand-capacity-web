import React, { Component } from 'react';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import CircularProgress from '@material-ui/core/CircularProgress';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';


export default class DisplayExistingData extends Component {

    constructor(props) {
        super(props);

        this.fetchData = this.fetchData.bind(this);

        this.state = {
            json: null,
            loaded: false
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


    componentDidMount () { 
        this.fetchData()
       .then((result) => {return result.json();})
       .then((data) => {
            this.setState({
                  json: data,
                  loaded: true
                })
            }
        );
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
                        <AgGridColumn field='date' />
                        <AgGridColumn field='stream' />
                        <AgGridColumn field='nhs_number' />
                        <AgGridColumn field='arrival_time' />
                    </AgGridReact>
                </div>
            );
          }
        }
    };
