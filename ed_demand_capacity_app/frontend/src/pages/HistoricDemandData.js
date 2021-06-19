import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    CardContent,
    Modal
  } from '@material-ui/core';
import React, { Component } from "react";
import Card from '@material-ui/core/Card';
import axios from 'axios';
import { toast } from 'react-toastify';
import CircularProgress from '@material-ui/core/CircularProgress';
import DisplayExistingData from "../components/LoadedExistingDataset"
import { withStyles } from '@material-ui/core/styles';



// See https://stackoverflow.com/questions/57305141/react-django-rest-framework-session-is-not-persisting-working
axios.defaults.withCredentials = true;

// import { useStoreState } from 'easy-peasy';

const notify = () => toast.success('File uploaded successfully', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    });

const useStyles = theme => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    });

// const sessionHasHistoricData = useStoreState(state => state.sessionHasHistoricData)

class HistoricDemandData extends Component {
    constructor(props) {

        super(props);
    this.getHeaders = this.getHeaders.bind(this);
    this.fetchHistoricBool = this.fetchHistoricBool.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    
}
    // Should this move inside the constructor and change to this.state?
    // See CreateRoomPage.js in tutorial app
    state = {
        existing_data_check_complete: false,
        session_has_historic_data: null,
        uploaded_data: null,
        successful_submission: null,
        loggedIn: localStorage.getItem('token') ? true : false,
        deleteConfirmationModalOpen: false
      };

    handleOpen() {
        this.setState({
            deleteConfirmationModalOpen: true
        });
    };

    handleClose() {
        this.setState({
            deleteConfirmationModalOpen: false
        });
    };


    // // When page loads, check whether there is already any data associated with the session
    // // If there is, display this and give the user the option to get rid of it
    // // If there isn't, allow users to upload the data instead
    // componentDidMount () { 
    // console.log(this.props.api_url)
    // this.fetchData()

    // .then((response) => {
    //     return response.json();
        
    // })
    
    // .then((data) => {
    //     // It's necessary to use the next line as for some reason
    //     // the server is returning a json-like object rather than
    //     // a valid json
    //     var fixedJson = $.parseJSON(data);
    //     this.setState({
    //         json: fixedJson,
    //         loaded: true
    //     });
    //     // console.log(data)
    //     });
    // }

    // This can't use the redux store because this is a functional component
    fetchHistoricBool() {
        return fetch('api/session-has-historic-data')
            // Make sure to not wrap this first then statement in {}
            // otherwise it returns a promise instead of the json
            // and then you can't access the email attribute 
            .then(response => 
                response.json()
            )
            .then((json) => {
                return json["result"];
            });
    }

    getHeaders() {
    if (this.state.loggedIn) {
        return  {
            'content-type': 'multipart/form-data',
            'authorization': `JWT ${localStorage.getItem('access_token')}`
          }
    } else {
        return  {
            'content-type': 'multipart/form-data'
          }
    }};


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

    componentDidMount () { 
        this.fetchHistoricBool()
        .then((data) => {
          // It's necessary to use the next line as for some reason
          // the server is returning a json-like object rather than
          // a valid json
            this.setState({
              existing_data_check_complete: true,
              session_has_historic_data: data,
            });
          // console.log(data)
        });
    }

    render() {
        const { classes } = this.props;
    if (!this.state.existing_data_check_complete) {
        return (
            <CircularProgress />
          );
    } else {

        if (this.state.session_has_historic_data) {
            return (
                <div>
                    <Grid container spacing={3} align="center">
                        <Grid item xs={12}>
                            <Typography > Data has already been uploaded. </Typography>
                            <Button 
                                variant="contained" 
                                onClick={this.handleOpen}
                            > Delete this data
                            </Button>
                            <Modal
                                open={this.state.deleteConfirmationModalOpen}
                                onClose={this.handleClose}
                                aria-labelledby="simple-modal-title"
                                aria-describedby="simple-modal-description"
                                >
                                <div className={classes.paper}>
                                    <h2 id="simple-modal-title">Are you sure you want to delete this historic data?</h2>
                                    <p id="simple-modal-description">
                                    There is no way to get it back if you do!
                                    </p>
                                </div>
                            </Modal>
                                                            
                            </Grid>
                        </Grid>
                            <DisplayExistingData api_url='/api/most-recently-uploaded-ag-grid-json' />
                        
                </div>
            )
        } else {

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
    }
}

export default withStyles(useStyles)(HistoricDemandData);