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
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { connect } from 'react-redux';



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

const notifyDelete = () => toast.success('Existing historic data deleted', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
});

const notifyColsSelected = () => toast.success('Successfully selected relevant columns', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
});

// UPDATE TO IMPORT THIS FROM ELSEWHERE?
const font =  "'Istok Web', sans-serif;";

// Styling for modal
const useStyles = theme => ({
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        fontFamily: font,
        alignItems: 'baseline'
    },

    root: {
        '& > *': {
          margin: theme.spacing(1),
        },
      },

    formControl: {
        margin: theme.spacing(1),
        minWidth: 180,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
});

// const sessionHasHistoricData = useStoreState(state => state.sessionHasHistoricData)

class HistoricDemandData extends Component {
    constructor(props) {
        super(props);
            this.getHeaders = this.getHeaders.bind(this);
            this.getHeadersColSelectRequest = this.getHeadersColSelectRequest.bind(this);
            this.fetchHistoricBool = this.fetchHistoricBool.bind(this);
            this.handleOpen = this.handleOpen.bind(this);
            this.handleClose = this.handleClose.bind(this);
            this.handleDeleteAndClose = this.handleDeleteAndClose.bind(this);
            this.handleChangeStreamCol = this.handleChangeStreamCol.bind(this);
            this.handleChangeDateTimeCol = this.handleChangeDateTimeCol.bind(this);
            this.fetchColumnList = this.fetchColumnList.bind(this);
            this.renderListColumns = this.renderListColumns.bind(this);
            this.handleSubmitSelectedColumns = this.handleSubmitSelectedColumns.bind(this);
            this.handleFileChange = this.handleFileChange.bind(this);
            this.handleFileChangeExcel = this.handleFileChangeExcel.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.handleSubmitExcel = this.handleSubmitExcel.bind(this);
    }
    // Should this move inside the constructor and change to this.state?
    // See CreateRoomPage.js in tutorial app
    state = {
        existing_data_check_complete: false,
        session_has_historic_data: null,
        uploaded_data: null,
        uploaded_data_excel: null,
        successful_submission: null,
        loggedIn: localStorage.getItem('token') ? true : false,
        deleteConfirmationModalOpen: false,
        colsSelected: true,
        allDataframeColumnsList: null,
        dateTimeColumn: '',
        streamColumn: '',
        waitingForDataProcessing: false,

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

    // ADD 'if response == 200' check to this
    handleDeleteAndClose() {
        fetch('/api/delete-session-historic-data', {method: 'POST'});

        this.setState({
            deleteConfirmationModalOpen: false,
            session_has_historic_data: false
        });

        notifyDelete(); 

    };

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


    getHeadersColSelectRequest() {
        if (this.state.loggedIn) {
            return  {
                'content-type': 'application/json',
                'authorization': `JWT ${localStorage.getItem('access_token')}`
              }
        } else {
            return  {
                'content-type': 'application/json'
              }
        }};
    

    // Handle file upload
    // From *TO DO*: Find link
    handleFileChange = (e) => {
        this.setState({
            uploaded_data: e.target.files[0]
            })
    };

    handleFileChangeExcel = (e) => {
        this.setState({
            uploaded_data_excel: e.target.files[0]
            })
    };

    // Handle submission of uploaded file
    // From *TO DO*: Find link 
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
                        successful_submission: "File uploaded successfully!",
                        session_has_historic_data: true,
                        colsSelected: false
                        })   

                    
                }
            })
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
        })
            .catch(err => console.log(err))
    };

    handleSubmitSelectedColumns = (e) => {
        e.preventDefault();

        // let form_data = new FormData();
        // form_data.append('datetime_column', 
        //                     this.state.dateTimeColumn
        //                     );
        // form_data.append('stream_column', 
        //                     this.state.streamColumn
        //                     );
        // console.log(form_data);
        let jsonData = {'datetime_column': this.state.dateTimeColumn,
                        'stream_column':this.state.streamColumn}
        let url = '/api/filter-by-cols-and-overwrite-data';
        let conditional_request_headers = this.getHeadersColSelectRequest();
        console.log(jsonData)
        console.log(conditional_request_headers)
        this.setState({
            waitingForDataProcessing: true
            })  
        // axios.post(url, form_data, {
        axios.post(url, jsonData, {    
            headers: conditional_request_headers
        })
            .then(res => {
                console.log(res);
                if(res.status == 200) {
                console.log("File updated successfully")
                notifyColsSelected();    
                this.setState({
                    colsSelected: true,
                    waitingForDataProcessing: false
                    })   
                }
            })
            .catch(err => console.log(err))
    }

    //const classes = useStyles();

    handleSubmitExcel = (e) => {
        e.preventDefault();
        // console.log(this.state);
        let form_data = new FormData();
        form_data.append('uploaded_data', 
                            this.state.uploaded_data_excel, 
                            this.state.uploaded_data_excel.name,
                            );
        let url = '/api/historic-data';
        let conditional_request_headers = this.getHeaders();
        this.setState({
            waitingForDataProcessing: true
            })   

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
                        uploaded_data_excel: null,
                        successful_submission: "File uploaded successfully!",
                        session_has_historic_data: true,
                        colsSelected: true,
                        waitingForDataProcessing: false
                        })   

                    
                }
            })
        }

    componentDidMount () { 
        this.fetchHistoricBool()
        .then((data) => {
          // It's necessary to use the next line as for some reason
          // the server is returning a json-like object rather than
          // a valid json
            this.setState({
              session_has_historic_data: data,
            });
          // console.log(data)
        })

        // If there is data, get the column names from the data
        .then(

        () => {if (this.state.session_has_historic_data) {
            // *TODO* Is this fetch needed? Check.
            this.fetchColumnList()
            .then((data) => {
                // It's necessary to use the next line as for some reason
                // the server is returning a json-like object rather than
                // a valid json
                  this.setState({
                    allDataframeColumnsList: data.map(data => ({label:data, value:data})),
                    // existing_data_check_complete: true,
                  });
                // console.log(data)
              });
        }
    })
        .then(() => 
        this.setState({
            // allDataframeColumnsList: data.map(data => ({label:data, value:data})),
            existing_data_check_complete: true,
          
    }));
    }

    handleChangeDateTimeCol = e =>{
        this.setState({dateTimeColumn: e.target.value});
        }

    handleChangeStreamCol = e =>{
        this.setState({streamColumn: e.target.value});
        }

    renderListColumns() {
        if (this.state.allDataframeColumnsList) {
            return this.state.allDataframeColumnsList.map(data => ({label:data, value:data}));
        } else {
            return [{label:"No column labels retrieved", value:"No column labels retrieved"}];
        }
    }

    render() {
    
    // For styling
    const { classes } = this.props;

    // If API call to retrieve existing data has not yet happened, 
    // return a circular loading bar
    if (!this.state.existing_data_check_complete) {
        return (
            <CircularProgress />
          );
        }

    else if (this.state.waitingForDataProcessing) {
        return (
            <div>
            <CircularProgress />
            <br />
            <Typography variant="h6">
                Performing initial data processing. 
                This will take up to five minutes.
                Please wait...
            </Typography>
            </div>
        );
    

    } else {
        
        // *TO DO*: reorder these three views so they match the logical order you would
        // progress through them, just because it will make it easier for the next person
        // to understand the code


        // If the user has uploaded data but has not yet specified the relevant columns
        // from the data, then 
        // This view will only be seen straight after successfully uploading data 


        // For rendering select
        // https://stackoverflow.com/questions/64298136/react-material-ui-select-not-working-properly

        
        if (this.state.session_has_historic_data && !this.state.colsSelected) {
            return (
                <div>
                    
                    <Typography variant="h6"> Select the columns from your dataset that contain admission date/time and stream.</Typography>
                    <FormControl className={classes.formControl}>
                        <InputLabel id="select-date-time-column-label">Admission Datetime</InputLabel>
                        <Select
                            labelId="select-date-time-column-label"
                            id="select-date-time-column"
                            value={this.state.dateTimeColumn}
                            onChange={this.handleChangeDateTimeCol}
                        >
                        {(this.state.allDataframeColumnsList || []).map((colName) => {
         return <MenuItem key={colName.value} value={colName.value}>{colName.label}</MenuItem>
      })}
      </Select>

                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel id="select-stream-column-label">Stream Column</InputLabel>
                        <Select
                            labelId="select-stream-column-label"
                            id="select-stream-column"
                            value={this.state.streamColumn}
                            onChange={this.handleChangeStreamCol}
                        >
                        
                        {(this.state.allDataframeColumnsList || []).map((colName) => {
         return <MenuItem key={colName.value} value={colName.value}>{colName.label}</MenuItem>
      })}
      </Select>
                    </FormControl> 

                    {/* <form onSubmit={this.handleSubmitSelectedColumns}> */}
                            <Button color="secondary" variant="contained" component="label" onClick={this.handleSubmitSelectedColumns}> 
                                Confirm column selection
                                {/* <input
                                    type="file"
                                    accept=".csv"
                                    hidden
                                    onChange={this.handleFileChange}
                                /> */}
                            </Button>

                    {/* </form> */}

                    <Typography variant="h6"> Preview of your uploaded data </Typography>
                    <br /> <br /> <br />
                    <Grid container >
                        <Grid item align="center" xs={12}>
                            <DisplayExistingData api_url='/api/most-recently-uploaded-ag-grid-json' />
                        </Grid>
                    </Grid>
                </div>
            )
        }



        // If the user has historic data and they have selected which columns in the 
        // data are relevant (which defaults to true on page load and only gets set
        // to false during data upload), display that historic data and give them the 
        // option to remove it from the server.
        else if (this.state.session_has_historic_data && this.state.colsSelected) {
            return (
                <div>
                    <Grid container spacing={3} align="center">
                        <Grid item xs={12}>
                            <Typography > Data has already been uploaded. </Typography>
                            <Button 
                                variant="contained" 
                                onClick={this.handleOpen}
                            > Delete this data and upload new data
                            </Button>
                            <Modal
                                // style={{ alignItems: "center", justifyContent: "center" }}
                                open={this.state.deleteConfirmationModalOpen}
                                onClose={this.handleClose}
                                aria-labelledby="simple-modal-title"
                                aria-describedby="simple-modal-description"
                                >
                                <div className={classes.paper}>
                                    <h2 id="simple-modal-title">Are you sure you want to delete this historic data?</h2>
                                    <p id="simple-modal-description">
                                    There is no way to get it back if you do!

                                    You will be given the option to upload new data on the next screen.
                                    </p>
                                    <div className={classes.root}> 
                                    <Button 
                                        variant="contained" 
                                        color="secondary"
                                        onClick={this.handleDeleteAndClose}> Yes, Delete </Button>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={this.handleClose}> No, Go Back </Button>
                                    </div>
                                </div>
                            </Modal>
                                                            
                            </Grid>
                        </Grid>
                        <br /> <br /> <br />
                        <Grid container >
                        <Grid item align="center" xs={12}>
                            <DisplayExistingData api_url='/api/most-recently-uploaded-ag-grid-json' />
                            </Grid>
                        </Grid>
                        
                </div>
            )
        } else {

        return (

            // If the API call shows that there is no data associated with this user's session,
            // show the file upload page
            // This will also be shown if users have data and choose to delete this data - after
            // the delete completes successfully, this view will show
            
            <div>
                <Grid container spacing={1}>
                
                <Grid container item xs={6}>
                    <Card paddingBottom={4}>
                        <CardContent>
                        <Typography variant='h3'> Option 1 </Typography>
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
                        <form onSubmit={this.handleSubmit} id="csv">
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
                        <Typography variant='h3'> Option 2 </Typography>
                        <Typography variant='h4'>
                            Is your data being imported from the Excel model?
                        </Typography>
                        <Typography variant='h6'>
                            <br/>
                            If you have previously filled in the Excel model, you can upload the Excel file
                            to extract the historic data in it. 
                            <br/><br/>
                        </Typography>
                        <form onSubmit={this.handleSubmitExcel} id="xlsb">
                        <Button color="secondary" variant="contained" component="label" onChange={this.handleFileChangeExcel}>
                            Upload Excel Model
                            <input
                                type="file"
                                accept=".xlsb"
                                hidden
                            />
                        </Button>
                        <br/>
                            {
                                this.state.uploaded_data_excel ? (
                                    <Typography variant="h6">File selected: {this.state.uploaded_data_excel.name}</Typography>
                                ) : (
                                    <Typography variant="h6">No file selected</Typography>
                                )
                            }
                        <Button color="primary" 
                                    variant="contained" 
                                    component="label" 
                                    disabled={!this.state.uploaded_data_excel}
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
                        <Typography variant='h3'> Option 3 </Typography>
                        <Typography variant='h4'>
                            Do you want to enter your data into a template?
                        </Typography>
                        <Typography variant='h6'>
                            <br/>
                            You can download a template below and fill it in using Excel or another spreadsheet software.
                            <br/><br/>
                        </Typography>
                        <Button color="primary" variant="contained" component="label" disabled={true}>
                            Download Template
                            <input
                                type="file"
                                accept=".xls,.xlsx"
                                hidden
                            />
                        </Button>
                        <br/><br/>
                        <Button color="primary" variant="contained" component="label" disabled={true}>
                            Upload Completed Template
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

// withStyles(useStyles, { withTheme: true }) required for formatting of the 
// MUI modal dialogue when writing class components
export default withStyles(useStyles, { withTheme: true })(HistoricDemandData);