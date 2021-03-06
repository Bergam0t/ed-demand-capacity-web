import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    CardContent,
    Modal,
    ButtonGroup,
    Divider,
    Card,
    Tooltip,
    InputAdornment,
    Select,
    MenuItem,
    Input
  } from '@material-ui/core';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import HelpIcon from '@material-ui/icons/Help';
import DateFnsUtils from '@date-io/date-fns'; 
import moment from 'moment'


import DeleteIcon from '@material-ui/icons/Delete';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactPlayer from "react-player"

import {
    DatePicker,
    TimePicker,
    DateTimePicker,
    MuiPickersUtilsProvider,
    KeyboardDatePicker
  } from '@material-ui/pickers';

  import 'date-fns';

const useStyles = makeStyles((theme) => ({

    dialog: {
        borderRadius: "10px",
        height: "auto",
      },

    paper: {
    overflow: "hidden",
    // margin: "10px",
    maxHeight: "none",
    padding: "10px"
    },

    dialogPaper: {

        maxHeight: '80vh',
        maxWidth: '80vw',
        overflow: "hidden",
    },

    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
    },

    tableHead: {
        background: '#cdcdcd',
     },

     tableHeadCell: {
        fontWeight: 800,
     }

    })
);


export default function AdditionalFactorsRequiredCapacity() {

    const classes = useStyles();

    const loggedIn = useStoreState(state => state.loggedIn)

    // Initialise state for determining whether the page has finished loading
    const [factorsLoaded, setFactorsLoaded] = React.useState(false)
    const [streamsLoaded, setStreamsLoaded] = React.useState(false)

    // Function to get relevant request headers depending on whether the user is logged
    // in or not
    function getHeaders() {
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



    // ---------------- //
    // Load factors
    // -=-------------- //

    const [factors, setFactors] = React.useState([])

    const fetchFactors = () => {
        /**
         * Fetch a list of factirs from the API
         * Updates following states: rotaEntries, rotaEntriesLoaded
         */
        return fetch('api/own-required-capacity-factors')
        // Make sure to not wrap this first then statement in {}
        // otherwise it returns a promise instead of the json
        // and then you can't access the email attribute 
        .then(response => 
            response.json()
        )
        .then((json) => 
            setFactors(json)
        )
        .then(() => 
            setFactorsLoaded(true)
        )
        };



    // ----------------- //
    // Streams 
    // ----------------- //

    const [streams, setStreams] = React.useState(null)

    const fetchStreams = () => {
        /**
         * Fetch a list of streams from the API
         * Sorts streams by priority
         * Updates following states: streams, streamsOriginal, streamsLoaded
         */
        return fetch('api/get-historic-data-streams-from-db')
            // Make sure to not wrap this first then statement in {}
            // otherwise it returns a promise instead of the json
            // and then you can't access the email attribute 
            .then(response => 
                response.json()
            )
            .then((json) => {
                // Sort the returned states by priority
                // From https://www.javascripttutorial.net/array/javascript-sort-an-array-of-objects/
                const sorted_json = json.sort((a, b) => {
                    return a.stream_priority - b.stream_priority
                }).slice()
                setStreams(sorted_json);
                
            })
            .then(() => setStreamsLoaded(true))
      };


    // ------------------------- //
    // Modal for entering factors
    // ------------------------- //


    // Handle dialog open/close
    const [addFactorOpen, setAddFactorOpen] = React.useState(false);

    // Handle factor description

    const startDatePeriodOfInterest = useStoreState(state => state.startDatePeriodOfInterest)
    const endDatePeriodOfInterest = useStoreState(state => state.endDatePeriodOfInterest)

    const [factorDescription, setFactorDescription] = useState('');

    const [percentageChange, setPercentageChange] = useState(0);

    const [increaseOrDecrease, setIncreaseOrDecrease] = useState('increase');

    const [factorType, setFactorType] = useState('')

    const [streamsSelected, setStreamsSelected] = useState([])

    const DefaultTime = new Date("January 1 2021 12:00");

    const [startDateFactor, setStartDateFactor] = React.useState(startDatePeriodOfInterest);

    const [startTimeFactor, setStartTimeFactor] = React.useState(DefaultTime);

    const [endDateFactor, setEndDateFactor] = React.useState(endDatePeriodOfInterest);

    const [endTimeFactor, setEndTimeFactor] = React.useState(DefaultTime);
    

    function disableDatesOutsideInterest(date) {
        return (date < startDatePeriodOfInterest || date > endDatePeriodOfInterest) ;
      }


    function handleDiscard() {
        // Reset all values to defaults
        setFactorDescription('');
        setPercentageChange(0);
        setIncreaseOrDecrease('increase');
        setFactorType('')
        setStreamsSelected([])
        setStartDateFactor(startDatePeriodOfInterest);
        setStartTimeFactor(DefaultTime);
        setEndDateFactor(endDatePeriodOfInterest)
        setEndTimeFactor(DefaultTime);
        

        // Close the dialog box
        setAddFactorOpen(false)
    }

    function handleConfirmCreateFactor() {
        let headers = getHeaders()
   
        const requestOptions = {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                factor_name: factorDescription,

                percentage_change: percentageChange,
                increase_or_decrease: increaseOrDecrease,
                
                streams: streamsSelected,

                factor_type: factorType,
                
                start_date: startDateFactor,
                start_time: startTimeFactor,
                
                end_date: endDateFactor,
                end_time: endTimeFactor,

                
            })
        };
    
        console.log(requestOptions)
    
        fetch('/api/create-required-capacity-factor', requestOptions).then((response) => {
            if (response.ok) {
                console.log("Required capacity factor created successfully")
                fetchFactors()
                handleDiscard()
            } else {
                console.log("Error creating required capacity factor")
            }
        })
        .catch((error) => {
            console.log(error);
        });



        handleDiscard()
    }

    function factorEntryModal() {
        if (streamsLoaded) {
        return (
          <div>
            <Dialog
            open={addFactorOpen}
            onClose={() => setAddFactorOpen(false)}
            classes={{
                root: classes.dialog,
                paper: classes.paper
            }}
            disableBackdropClick
            >
              <Box>  
              <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
                <Grid item xs={6} align="left">
                  <DialogTitle>
                      Create a new factor
                  </DialogTitle>
                </Grid>
                <Grid item xs={6} align="right">
                  <IconButton onClick={() => setAddFactorOpen(false)} >
                      <CancelIcon />
                  </IconButton>
                </Grid>
            
                <Grid item xs={12}>
                  <DialogContentText>
                      Here you can specify whether the factor leads to an increase or decrease in required capacity, as well as
                      what time period the factor acts over.
                  </DialogContentText>
                </Grid>
    
                <Grid item xs={10}>
                        <TextField
                            required
                            fullWidth
                            margin="dense"
                            id="resource-name"
                            label="Factor Description"
                            type="text"
                            onChange={(e) => setFactorDescription(e.target.value)}
                        />
                        <br /><br /><br />
                </Grid>
                <Grid item xs={2}>
                  <Tooltip 
                    title="Record the description of the factor (e.g. hot weather)"
                    classes={{tooltip: classes.tooltip}}>
                    <IconButton aria-label="delete">
                      <HelpIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                
                <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Typography variant="h6">
                        Factor Type
                    </Typography>
                </Grid>
                <Grid item xs={8}>
                        <Select
                            labelId="factor-type-label"
                            id="factor-type"
                            value={factorType}
                            label="Select Factor Type"
                            placeholder="Select Factor Type"
                            onChange={(e) => setFactorType(e.target.value)}
                            fullWidth
                        >
                            <MenuItem key="attendances" value="attendances">Attendances</MenuItem>
                            <MenuItem key="decision-time" value="required-decision-making-time">Required Decision Making Time</MenuItem>
                        </Select>
                        <br /> <br /> <br /> 
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Typography variant="h6">
                        Streams Affected
                    </Typography>
                </Grid>
                <Grid item xs={8}>
                        <Select
                            labelId="stream-select-label"
                            id="stream-select"
                            value={streamsSelected}
                            label="Select Streams Affected"
                            onChange={(e) => setStreamsSelected(e.target.value)}
                            fullWidth
                            multiple
                        >
                            {streams.map((stream) =>(
                                <MenuItem key={stream.id} value={stream.id}>{stream.stream_name}</MenuItem>

                            ))}
                        </Select>
                        <br /> <br /> <br /> 
                    </Grid>
                </Grid>

               

                <Grid container spacing={4}>
                    <Grid item xs={4}>
                            <Input
                                required
                                fullWidth
                                margin="dense"
                                id="percentage-change"
                                label="Percentage Change"
                                type="number"
                                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                value = {percentageChange}
                                onChange={(e) => e.target.value < 0 ? setPercentageChange(0) : setPercentageChange(e.target.value)}
                            />
                            <br /><br /><br />
                    </Grid>
                    <Grid item xs={8}>
                        <Select
                            labelId="increase-or-decrease-label"
                            id="increase-or-decrease"
                            value={increaseOrDecrease}
                            label="Increase or Decrease"
                            onChange={(e) => setIncreaseOrDecrease(e.target.value)}
    
                        >
                            <MenuItem key="increase" value="increase">Increase</MenuItem>
                            <MenuItem key="decrease" value="decrease">Decrease</MenuItem>
                        </Select>
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}> 
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="normal"
                                id="date-picker-start-date-factor"
                                label="Start date for factor"
                                value={startDateFactor}
                                onChange={(e) => setStartDateFactor(e)}
                                KeyboardButtonProps={{
                                'aria-label': 'change date',
                                }}
                                shouldDisableDate={disableDatesOutsideInterest}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <TimePicker 
                                    required
                                    label="Factor Start Time" 
                                    value={startTimeFactor} 
                                    onChange={setStartTimeFactor} 
                                />
                            </MuiPickersUtilsProvider>
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={6}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}> 
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="normal"
                                id="date-picker-end-date-factor"
                                label="End date for factor"
                                value={endDateFactor}
                                onChange={(e) => setEndDateFactor(e)}
                                KeyboardButtonProps={{
                                'aria-label': 'change date',
                                }}
                                shouldDisableDate={disableDatesOutsideInterest}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <TimePicker 
                                    required
                                    label="Factor End Time" 
                                    value={endTimeFactor} 
                                    onChange={setEndTimeFactor} 
                                />
                            </MuiPickersUtilsProvider>
                    </Grid>
                </Grid>


              <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
              <Grid item xs={12}>
                  <br /> <br />
                  <ButtonGroup disableElevation variant="contained" color="primary" fullWidth>
                      <Button 
                          variant="contained" 
                          color="secondary" 
                          onClick={handleDiscard}
                      >
                          Discard
                      </Button>

                      <Button 
                          variant="contained" 
                          color="primary"
                          onClick={handleConfirmCreateFactor}
                      >
                          Confirm
                      </Button>
                  </ButtonGroup>
              </Grid>
          </Grid>

                </Grid>
                </Box>
                </Dialog> 
                </div>
                ) } else {
                    return (
                        <div>
                        <CircularProgress />
                    </div>
                    ) 
                } 
        }

    // ----------------------- //
    // Deletion of factors
    // ----------------------- //

    // Add function to handle deletion of shift types on click
    const handleDeleteFactor = (factor_id) => {
    fetch('/api/delete-required-capacity-factor/' + factor_id, 
            {method: 'POST'})
            .then(() => {
            fetchFactors()
            })
            .then(() => {
                notifyDelete()
            });
    };

    const notifyDelete = () => toast.success('Factor Deleted', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    // -------------------- //
    // Display of factors
    // -------------------- //

    function formatTime(time) {
        var dt = new Date(time)
        return (
            !dt.getTime() > 0 ? " " : moment(time).format('HH:mm')
        )
    }

    function formatDate(time) {
        var dt = new Date(time)
        return (
            !dt.getTime() > 0 ? " " : moment(time).format('dddd Do MMMM YYYY')
        )
    }

    function capitalise(string) {
        /** Capitalise the first letter of a string
        // From https://flexiple.com/javascript-capitalize-first-letter/
        */
        return (
            string.charAt(0).toUpperCase() + string.slice(1)
        )
    }

    function returnStreams(array_of_streams) {
        /**
         * Iterate through list of stream ids and return 
         * the stream names
         * 
         * TODO: return 'All' if array_of_streams contains all streams
         * that exist in the database for this user
         */
        const output_array = array_of_streams.map((stream) => {
            for (var i in streams) {
                console.log(i)
                if (streams[i].id == stream) {
                return streams[i].stream_name 
            }
        }
    })
    return output_array.join(', ')
}

    function displayFactors() {
        if (factorsLoaded && streamsLoaded) {
    
          return (
            <div>
                <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                
                    <TableHead className={classes.tableHead}>
                        <TableRow className={classes.tableHeadCell}>
                            <TableCell className={classes.tableHeadCell}>Factor</TableCell>
                            <TableCell className={classes.tableHeadCell}>Percentage Change</TableCell>
                            <TableCell className={classes.tableHeadCell}>Increase or Decrease?</TableCell>
                            <TableCell className={classes.tableHeadCell}>Streams Affected</TableCell>
                            <TableCell className={classes.tableHeadCell}>Factor Type</TableCell>
                            
                            <TableCell className={classes.tableHeadCell}>Start Date</TableCell>
                            <TableCell className={classes.tableHeadCell}>Start Time</TableCell>
                            
                            <TableCell className={classes.tableHeadCell}>End Date</TableCell>
                            <TableCell className={classes.tableHeadCell}>End Time</TableCell>

                            <TableCell className={classes.tableHeadCell}>Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        
                            {factors.map((factor) =>
                            <TableRow>
                                <TableCell>{factor.factor_name}</TableCell>
                                <TableCell>{factor.percentage_change}%</TableCell>
                                <TableCell>{capitalise(factor.increase_or_decrease)}</TableCell>
                                <TableCell>{returnStreams(factor.streams)}</TableCell>
                                <TableCell>{capitalise(factor.factor_type)}</TableCell>
                                <TableCell>{formatDate(factor.start_date)}</TableCell>
                                <TableCell>{formatTime(factor.start_time)}</TableCell>
                                <TableCell>{formatDate(factor.end_date)}</TableCell>
                                <TableCell>{formatTime(factor.end_time)}</TableCell>

                                <TableCell align="left">
                                    <IconButton onClick={() => handleDeleteFactor(factor.id)}> 
                                        <DeleteIcon />
                                    </ IconButton>
                                </TableCell>
                            </TableRow>
                            )}
                        

                    </TableBody>
                </Table>
            </TableContainer>
            </div>)
            } else {
            return (
                <div>
                    <CircularProgress />
                </div>
            )
            }
        }

    // Determine what will run on page load
    // Get streams from server
    useEffect(() => {
        fetchStreams()
        fetchFactors()     
    }, []);

    // As startDatePeriodOfInterest may have not been initialised by
    // the time it first attempts to be set, try and update it
    // when the dialog box gets opened (as the request should have)
    // completed by this point
    useEffect(() => {
        setStartDateFactor(startDatePeriodOfInterest)
        setEndDateFactor(endDatePeriodOfInterest) 
        setStreams(streams)        
    }, [addFactorOpen]);


    return (
        <div>
        <Typography variant="h3">
            Additional Factors Affecting Required Capacity
        </Typography>

        <Typography variant="h6">
            Here you can add additional factors that may affect your required capacity in the week.
            <br /><br />
            These may be 
            <br />
            - changes to the predicted number of attendances (e.g. due to hot weather, a nearby unit being closed, a sporting event)
            <br />
            - changes to the required decision making time (e.g. due to expected delays in test results being returned)
            

          <br /> <br />  
          <Button 
            variant="contained"
            color="primary"
            onClick={() => setAddFactorOpen(true)}>
              Add Factor
          </Button>

        {factorEntryModal()}
        <br /> <br />
        {displayFactors()}

        </Typography>
        </div>
        )

    }
