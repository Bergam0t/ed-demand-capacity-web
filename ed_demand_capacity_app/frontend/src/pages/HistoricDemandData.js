import {
    Grid,
    Typography,
    Button,
    ButtonGroup,
    CardContent,
    Modal,
    Paper
  } from '@material-ui/core';
import React, { useEffect } from "react";
import Card from '@material-ui/core/Card';
import axios from 'axios';
import { toast } from 'react-toastify';
import CircularProgress from '@material-ui/core/CircularProgress';
import DisplayExistingData from "../components/LoadedExistingDataset"
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { useStoreState, useStoreActions } from 'easy-peasy';



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
const useStyles = makeStyles((theme) => ({ 
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

    redPaper: {
        backgroundColor: '#ffa9a3',
        overflow: "hidden",
        // margin: "10px",
        maxHeight: "none",
        padding: "10px",
        elevation: 3,
        borderRadius: "4px"
    },
}));

// const sessionHasHistoricData = useStoreState(state => state.sessionHasHistoricData)

export default function HistoricDemandData() {
    
    // state = {
    //     existing_data_check_complete: false,
    //     session_has_historic_data: null,
    //     uploaded_data: null,
    //     uploaded_data_excel: null,
    //     successful_submission: null,
    //     loggedIn: localStorage.getItem('token') ? true : false,
    //     deleteConfirmationModalOpen: false,
    //     colsSelected: true,
    //     allDataframeColumnsList: null,
    //     dateTimeColumn: '',
    //     streamColumn: '',
    //     waitingForDataProcessing: false,

    //   };

    // Control of styling
    const classes = useStyles();

    const [existing_data_check_complete, set_existing_data_check_complete] = React.useState(false);
    const [session_has_historic_data, set_session_has_historic_data] = React.useState(null);
    const [uploaded_data, set_uploaded_data] = React.useState(null);
    const [uploaded_data_excel, set_uploaded_data_excel] = React.useState(null);
    const [successful_submission, set_successful_submission] = React.useState(null);
    const [loggedIn, setLoggedIn] = React.useState(localStorage.getItem('token') ? true : false);
    const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = React.useState(false);
    // const [colsSelected, setColsSelected] = React.useState(true);
    // const [allDataframeColumnsList, setAllDataframeColumnsList] = React.useState();
    const [dateTimeColumn, setDateTimeColumn] = React.useState('');
    const [streamColumn, setStreamColumn] = React.useState('');
    const [waitingForDataProcessing, setWaitingForDataProcessing] = React.useState(false);
    const [errorMessagesColSelect, setErrorMessagesColSelect] = React.useState('');

    const [submitButtonActive, setSubmitButtonActive] = React.useState(false);
    const [excelSubmitButtonActive, setExcelSubmitButtonActive] = React.useState(false);

    const [waitingForFileSubmission, setWaitingForFileSubmission] = React.useState(false);
    const [waitingForFileSubmissionExcel, setWaitingForFileSubmissionExcel] = React.useState(false);

    const [submitColsActive, setSubmitColsActive] = React.useState(false);
    const [waitingForColsSubmission, setWaitingForColsSubmission] = React.useState(false);

    // Check for processed data
    const sessionDataProcessed = useStoreState(state => state.sessionDataProcessed);
    const toggleDataProcessed = useStoreActions((actions) => actions.setSessionDataProcessed);
    
    const colsSelected = useStoreState(state => state.colsSelected);
    const setColsSelected = useStoreActions((actions) => actions.setColsSelected);

    const allDataframeColumnsList = useStoreState(state => state.allDataframeColumnsList)
    const setAllDataframeColumnsList = useStoreActions((actions) => actions.setAllDataframeColumnsList)
    const fetchInitialColData = useStoreActions((actions) => actions.fetchInitialColData)

    

    function handleOpen() {
        setDeleteConfirmationModalOpen(true)
    };

    function handleClose() {
        setDeleteConfirmationModalOpen(false)
    };

    // ADD 'if response == 200' check to this
    function handleDeleteAndClose() {
        fetch('/api/delete-session-historic-data', {method: 'POST'});
        setDeleteConfirmationModalOpen(false);
        set_session_has_historic_data(false);
        set_existing_data_check_complete(true);
        toggleDataProcessed(false);
        notifyDelete(); 


    };

    // This can't use the redux store because this is a functional component
    function fetchHistoricBool() {
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

    function fetchColumnList() {
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
    

    function getHeaders() {
    if (loggedIn) {
        return  {
            'content-type': 'multipart/form-data',
            'authorization': `JWT ${localStorage.getItem('access_token')}`
          }
    } else {
        return  {
            'content-type': 'multipart/form-data'
          }
    }};


    function getHeadersColSelectRequest() {
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
    

    // Handle file upload
    // From *TO DO*: Find link
    const handleFileChange = (e) => {
        set_uploaded_data(e.target.files[0])
        setSubmitButtonActive(true)
    };

    const handleFileChangeExcel = (e) => {
        set_uploaded_data_excel(e.target.files[0])
        setExcelSubmitButtonActive(true)
    };

    // Handle submission of uploaded file
    // From *TO DO*: Find link 
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitButtonActive(false);
        setWaitingForFileSubmission(true);
        // console.log(this.state);
        let form_data = new FormData();
        form_data.append('uploaded_data', 
                            uploaded_data, 
                            uploaded_data.name,
                            );
        let url = '/api/historic-data';
        let conditional_request_headers = getHeaders();
        // console.log(conditional_request_headers)
        axios.post(url, form_data, {
            headers: conditional_request_headers
        })
            .then(res => {
                console.log(res);
                if(res.status == 201) {
                    console.log("File upload successful")
                    notify();
                    set_uploaded_data(null);
                    set_successful_submission("File uploaded successfully!");
                    set_session_has_historic_data(true);
                    setColsSelected(false);
                    }  
                }
            )
            .then(() => {
                fetchColumnList()            
                .then((data) => {
                    // It's necessary to use the next line as for some reason
                    // the server is returning a json-like object rather than
                    // a valid json
                    setAllDataframeColumnsList(data.map(data => ({label:data, value:data})))
                        // existing_data_check_complete: true,
                      });
            })
            .then(() => setWaitingForFileSubmission(false));

            // .catch(err => console.log(err))
    };

    const handleSubmitSelectedColumns = (e) => {
        e.preventDefault();
        let jsonData = {'datetime_column': dateTimeColumn,
                        'stream_column': streamColumn}
        let url = '/api/filter-by-cols-and-overwrite-data';
        let conditional_request_headers = getHeadersColSelectRequest();
        console.log(jsonData)
        console.log(conditional_request_headers)
        // Update app state
        setWaitingForDataProcessing(true) 
        // Make API post request
        
        axios.post(url, jsonData, {    
            headers: conditional_request_headers
        })
            .then(res => {
                // console.log(res);
                if(res.status == 200) {
                    console.log("File updated successfully")
                    // Fire a notification for the user to confirm the columns got selected
                    notifyColsSelected();
                    // Update app state    
                    setColsSelected(true);
                    setWaitingForDataProcessing(false);
                    // Clear any error messages that were previously generated
                    setErrorMessagesColSelect('')
                    // Clear selected columns so that they're blank if the user
                    // deletes their data and tries to upload a new set
                    setStreamColumn('')
                    setDateTimeColumn('')
                } else {
                    // console.log(res)
                    // console.error("Can't select these columns")
                    setErrorMessagesColSelect("The columns you selected cannot be processed. \
                                               Please ensure that the date column you have selected contains the date followed by the time of admission \
                                               and the stream column is recording the stream each patient was assigned to.")
                    console.log("Error message set: ", errorMessagesColSelect)
                }
            })
            // .catch(err => console.log(err))
    }

    //const classes = useStyles();

    const handleSubmitExcel = (e) => {
        e.preventDefault();
        setExcelSubmitButtonActive(false);
        setWaitingForFileSubmissionExcel(true);
        // console.log(this.state);
        let form_data = new FormData();
        form_data.append('uploaded_data', 
                            uploaded_data_excel, 
                            uploaded_data_excel.name,
                            );
        let url = '/api/historic-data';
        let conditional_request_headers = getHeaders();
        setWaitingForDataProcessing(true)

        // console.log(conditional_request_headers)
        axios.post(url, form_data, {
            headers: conditional_request_headers
        })
            .then(res => {
                console.log(res);
                if(res.status == 201) {
                    console.log("File upload successful")
                    notify();
                    set_uploaded_data_excel(null);
                    set_successful_submission("File uploaded successfully!");
                    set_session_has_historic_data(true);
                    setColsSelected(true);
                    setWaitingForDataProcessing(false);
                }
            })
            .then(() => setWaitingForFileSubmissionExcel(false))
        }

    const handleChangeDateTimeCol = (e) =>{
        setDateTimeColumn(e.target.value)
        if (streamColumn) {
            setSubmitColsActive(true)
        }
        }

    const handleChangeStreamCol = (e) =>{
        setStreamColumn(e.target.value)
        if (dateTimeColumn) {
            setSubmitColsActive(true)
        }
        }

    function renderListColumns() {
        if (allDataframeColumnsList) {
            return allDataframeColumnsList.map(data => ({label:data, value:data}));
        } else {
            return [{label:"No column labels retrieved", value:"No column labels retrieved"}];
        }
    }

    function deleteAndTryAgain(message) {
        return (
            <div>
            <Typography variant="h6">
            {message}
            </Typography>
            <Button 
                        color="secondary" 
                        variant="contained" 
                        component="label" 
                        onClick={handleDeleteAndClose}
                        >
                    Delete data and start again 
            </Button>
            </div>
        )
    }

    useEffect(() => { 
        fetchHistoricBool()
        .then((data) => {
          // It's necessary to use the next line as for some reason
          // the server is returning a json-like object rather than
          // a valid json
            set_session_has_historic_data(data)
          console.log("Session has historic data? ", data)
        })

        // If there is data, get the column names from the data
        .then(() => {
            if (session_has_historic_data) {
            // *TODO* Is this fetch needed? Check.
            fetchColumnList()
            .then((data) => {
                // It's necessary to use the next line as for some reason
                // the server is returning a json-like object rather than
                // a valid json
                    console.log("Column List: ", data)
                    setAllDataframeColumnsList(data.map(data => ({label:data, value:data})))
                    // existing_data_check_complete: true,

                {console.log("Column list data retrieved by fetchColumnList:", data)}
              });
        }
    })
        .then(() => 
        fetchInitialColData()
        )
        .then(() => 
        set_existing_data_check_complete(true),
          
    )}
    , [])

    // ---------------------------------------- //
    // Control Rendering
    // ---------------------------------------- //
    
    // If API call to retrieve existing data has not yet happened, 
    // return a circular loading bar
    if (!existing_data_check_complete) {
        console.log("Checking for existing data")
        return (
            <div>
            <CircularProgress />
            <br /><br /><br />
            {deleteAndTryAgain("If this is loading for more than 30 seconds, something's not right. Try refreshing the page, but if that doesn't work, click the button below.")}
            </div>
          );
        }

    else if (!sessionDataProcessed && session_has_historic_data && colsSelected) {
        console.log("Session has historic data, cols have been selected but data not yet processed")
        return (
            <div>
            <CircularProgress />
            <br />
            <Typography variant="h6">
                Performing initial data processing. 
                This will take up to five minutes.
                Please wait...
            </Typography>
            <br /><br />
            {deleteAndTryAgain("Think something's broken?")}
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

        
        if (session_has_historic_data && !colsSelected) {
            console.log("Session has historic data but cols not yet selected")
            return (
                <div>
                    <Paper class={classes.paper}>
                    <Typography variant="h6"> Select the columns from your dataset that contain admission date/time and stream.</Typography>
                    <FormControl className={classes.formControl}>
                        <InputLabel id="select-date-time-column-label">Admission Datetime</InputLabel>
                        <Select
                            labelId="select-date-time-column-label"
                            id="select-date-time-column"
                            value={dateTimeColumn}
                            onChange={handleChangeDateTimeCol}
                        >
                        {(allDataframeColumnsList || []).map((colName) => {
         return <MenuItem key={colName.value} value={colName.value}>{colName.label}</MenuItem>
      })}
      </Select>

                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel id="select-stream-column-label">Stream Column</InputLabel>
                        <Select
                            labelId="select-stream-column-label"
                            id="select-stream-column"
                            value={streamColumn}
                            onChange={handleChangeStreamCol}
                        >
                        
                        {(allDataframeColumnsList || []).map((colName) => {
         return <MenuItem key={colName.value} value={colName.value}>{colName.label}</MenuItem>
      })}
      </Select>
                    </FormControl> 
                            <Button 
                                color="secondary" 
                                variant="contained" 
                                component="label" 
                                onClick={handleSubmitSelectedColumns}
                                disabled={!submitColsActive}> 
                                Confirm column selection
                            </Button>
                            </Paper>
                            <br /> 
                    <Typography> {errorMessagesColSelect} </Typography>

                    <Typography variant="h5"> Preview of your uploaded data </Typography>
                    <br />
                    <Button 
                        color="secondary" 
                        variant="contained" 
                        component="label" 
                        onClick={handleDeleteAndClose}
                        >
                    Delete data and start again 
                    </Button>
                    <br /> <br /> 
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
        else if (session_has_historic_data && colsSelected && sessionDataProcessed) {
            console.log("Session has historic data, cols have been selected and data has been processed.")
            return (
                <div>
                    <Grid container spacing={3} align="center">
                        <Grid item xs={12}>
                            <Typography > Data has already been uploaded. </Typography>
                            <Button 
                                variant="contained" 
                                onClick={handleOpen}
                            > Delete this data and upload new data
                            </Button>
                            <Modal
                                // style={{ alignItems: "center", justifyContent: "center" }}
                                open={deleteConfirmationModalOpen}
                                onClose={handleClose}
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
                                        onClick={handleDeleteAndClose}> Yes, Delete </Button>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={handleClose}> No, Go Back </Button>
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
        console.log("No data has been uploaded yet")
        return (

            // If the API call shows that there is no data associated with this user's session,
            // show the file upload page
            // This will also be shown if users have data and choose to delete this data - after
            // the delete completes successfully, this view will show
            
            <div>
                <Grid container>
                    <Grid item xs={12}>
                        <Paper class={classes.redPaper} align="center">
                            <Typography variant="h5">
                                Warning!
                            </Typography>
                            <Typography>
                                Please do not upload any real data to this prototype. 
                                <br /> 
                            </Typography>
                            <Grid container spacing = {1}>
                                <Grid item xs={6}>
                                    <Button
                                        variant="contained">
                                        Download a sample record-format dataset
                                    </Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                    <Button
                                        variant="contained">
                                        Download a sample Excel model
                                    </Button>
                                    </Grid>
                              </Grid>
                        </Paper>
                        <br />
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                <Grid item xs={12} med={6} lg={4}>
                    <Card padding={4} elevation={6}>
                        <CardContent>
                        <Typography variant='h3' style={{fontWeight: 800}}> Option 1 </Typography>
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
                        <form onSubmit={handleSubmit} id="csv">
                            <Button color="secondary" variant="contained" component="label">
                                Upload record-format data
                                <input
                                    type="file"
                                    accept=".csv"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </Button>
                            <br/>
                            {
                                uploaded_data ? (
                                    <Typography variant="h6">File selected: {uploaded_data.name}</Typography>
                                ) : (
                                    <Typography variant="h6">No file selected</Typography>
                                )
                            }
                            <Button color="primary" 
                                    variant="contained" 
                                    component="label" 
                                    disabled={!submitButtonActive}
                                    >
                                Confirm
                                <input
                                    type="submit"
                                    hidden
                                />
                            </Button>
                        </form>
                        {waitingForFileSubmission ? <CircularProgress /> : null}
                        </CardContent>   
                    </Card>
                </Grid>

                <Grid item xs={12} med={6} lg={4}>
                    <Card padding={4} elevation={6}>
                        <CardContent>
                        <Typography variant='h3' style={{fontWeight: 800}}> Option 2 </Typography>
                        <Typography variant='h4'>
                            Is your data in the Excel model?
                        </Typography>
                        <Typography variant='h6'>
                            <br/>
                            If you have previously filled in the Excel model, you can upload the Excel file
                            to extract the historic data in it. 
                            <br/><br/>
                        </Typography>
                        <form onSubmit={handleSubmitExcel} id="xlsb">
                        <Button color="secondary" variant="contained" component="label" onChange={handleFileChangeExcel}>
                            Upload Excel Model
                            <input
                                type="file"
                                accept=".xlsb"
                                hidden
                            />
                        </Button>
                        <br/>
                            {
                                uploaded_data_excel ? (
                                    <Typography variant="h6">File selected: {uploaded_data_excel.name}</Typography>
                                ) : (
                                    <Typography variant="h6">No file selected</Typography>
                                )
                            }
                        <Button color="primary" 
                                    variant="contained" 
                                    component="label" 
                                    disabled={!excelSubmitButtonActive}
                                    >
                                Confirm
                                <input
                                    type="submit"
                                    hidden
                                />
                            </Button>
                            </form>
                            {waitingForFileSubmissionExcel ? <CircularProgress /> : null}
                        </CardContent>   
                    </Card>
                </Grid>

                <Grid item xs={12} med={6} lg={4}>
                    <Card padding={4} elevation={6}>
                        <CardContent>
                            <Grid container>
                                <Grid item xs={8}>
                                    <Typography variant='h3' style={{fontWeight: 800}}> Option 3 </Typography> 
                                </Grid>
                                <Grid item xs={4} align="right">
                                <Typography variant='h5'> (Coming Soon) </Typography>
                            </Grid>
                        </Grid>
                        <Typography variant='h4'>
                            Do you want to enter your data into a template?
                        </Typography>
                        <Typography variant='h6'>
                            <br/>
                            You can download a template below and fill it in using Excel or another spreadsheet software.
                            <br/><br/>
                        </Typography>
                        <Button color="primary" variant="contained" component="label" download target='_blank' href=''>
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


