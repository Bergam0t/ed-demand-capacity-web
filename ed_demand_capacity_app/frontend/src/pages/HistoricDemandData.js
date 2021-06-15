import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    CardContent
  } from '@material-ui/core';
import React, { Component } from "react";
import Card from '@material-ui/core/Card';
import axios from 'axios';
import { toast } from 'react-toastify';
// See https://stackoverflow.com/questions/57305141/react-django-rest-framework-session-is-not-persisting-working
axios.defaults.withCredentials = true;

//   import { makeStyles } from '@material-ui/core/styles';

//   const useStyles = makeStyles({
//     pos: {
//         marginBottom: 12,
//       },
//     });

import { useStoreState } from 'easy-peasy';

// const loggedIn = useStoreState(state => state.loggedIn)


const notify = () => toast.success('File uploaded successfully', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    });

    

class HistoricDemandData extends Component {
    constructor(props) {
        super(props);
    this.getHeaders = this.getHeaders.bind(this);
    }

    state = {
        uploaded_data: null,
        successful_submission: null,
        loggedIn: localStorage.getItem('token') ? true : false
      };

   
    getHeaders() {
    if (this.state.loggedIn) {
        return  {
            'content-type': 'multipart/form-data',
            'authorization': `JWT ${localStorage.getItem('token')}`
          }
    } else {
        return  {
            'content-type': 'multipart/form-data'
          }
    }};

    //   checkLoggedIn() {
    //     if (!loggedIn) {
    //         this.props.history.push('/login')
    //     }
    // }

      handleFileChange = (e) => {
        this.setState({
          uploaded_data: e.target.files[0]
        })
      };
    
      handleSubmit = (e) => {
        e.preventDefault();
        // console.log(this.state);
        let form_data = new FormData();
        form_data.append('uploaded_data', 
                         this.state.uploaded_data, 
                         this.state.uploaded_data.name,
                         );
        let url = '/api/historic-data';
        let conditional_request_headers = this.getHeaders();
        // console.log(conditional_request_headers)
        axios.post(url, form_data, {
            headers: conditional_request_headers
        })
            .then(res => {
              console.log(res);
              if(res.status == 201) {
                console.log("File upload successful")
                notify();    
                this.setState({
                    uploaded_data: null,
                    successful_submission: "File uploaded successfully!"
                  })
                
            }
            })
            .catch(err => console.log(err))
        
      };

    //const classes = useStyles();

    render() {

    return (
        
        <div>
            <Grid container spacing={1}>
            
            <Grid container item xs={6}>
                <Card paddingBottom={4}>
                    <CardContent>
                    <Typography variant='h4'>
                        Is your data in record format?
                    </Typography>
                    <Typography variant='h6'>
                        <br/>
                        Record format data means you have one row per patient. 
                        <br/><br/>
                        Your data needs to contain columns for arrival date, arrival time, and stream.
                        <br/><br/>
                    </Typography>
                    <form onSubmit={this.handleSubmit}>
                        <Button color="secondary" variant="contained" component="label">
                            Upload record-format data
                            <input
                                type="file"
                                accept=".csv"
                                hidden
                                onChange={this.handleFileChange}
                            />
                         </Button>
                         <br/>
                         {
                            this.state.uploaded_data ? (
                                <Typography variant="h6">File selected: {this.state.uploaded_data.name}</Typography>
                            ) : (
                                <Typography variant="h6">No file selected</Typography>
                            )
}
                         <Button color="primary" 
                                 variant="contained" 
                                 component="label" 
                                 disabled={!this.state.uploaded_data}
                                 >
                            Confirm
                            <input
                                type="submit"
                                hidden
                            />
                         </Button>
                    </form>
                    </CardContent>   
                </Card>
            </Grid>

            <Grid container item xs={6}>
                <Card paddingBottom={4}>
                    <CardContent>
                    <Typography variant='h4'>
                        Is your data being imported from the Excel model?
                    </Typography>
                    <Typography variant='h6'>
                        <br/>
                        If you have previously filled in the Excel model, you can upload the Excel file
                        to extract the historic data in it. 
                        <br/><br/>
                    </Typography>
                    <Button color="primary" variant="contained" component="label" disabled={true}>
                        Upload Excel Model
                        <input
                            type="file"
                            accept=".xls,.xlsx"
                            hidden
                        />
                    </Button>
                    </CardContent>   
                </Card>
            </Grid>

        </Grid>
    </div>
            );
    }
}

export default HistoricDemandData;