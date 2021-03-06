import React, { Component, useState, useReducer, useEffect } from "react";
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
  } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns'; 
import {
  DatePicker,
  TimePicker,
  DateTimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
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
import moment from 'moment'
import { withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import { toast } from 'react-toastify';
import PlotlyPlot from "../components/PlotlyPlot" 
import { v4 as uuidv4 } from 'uuid';

const useStyles = makeStyles((theme) => ({
    // modal: {
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     // position: 'fixed',
    //     width: '60%',
    //     height: '50%',
    //     top: '50%',
    //     left: '50%',
    //     transform: 'translate(40%, 50%)',
    //     display:'block'
    //   },

    dialog: {
        borderRadius: "10px",
        height: "auto",
        // justifyContent: "center",
        // margin: "auto",
        // width: "auto"
      },

      paper: {
        overflow: "hidden",
        margin: "10px",
        maxHeight: "none"
      },

      container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
      },

          // Add formatting for the resulting table
    tableHead: {
        background: '#cdcdcd',
     },

     tableHeadCell: {
        fontWeight: 800,
     }

    })
);

export default function ShiftPage() {

    const classes = useStyles();

    const loggedIn = useStoreState(state => state.loggedIn)

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

    // Create a uuid that can be used as the key for the shift type plot div
    // If we update the uuid, the plot will be regenerated
    const [plotUUID, setPlotUUID] = React.useState(uuidv4())

    // Add function for retrieving shift types from the server
    // for this user session
    const fetchShiftTypes = () => {
        return fetch('api/own-shift-types')
            // Make sure to not wrap this first then statement in {}
            // otherwise it returns a promise instead of the json
            // and then you can't access the email attribute 
            .then(response => 
                response.json()
            )
            .then((json) => {
                setShiftTypes(json);
                // console.log(json)
            })
            .then(() => setLoaded(true));
      };

    const [shiftTypes, setShiftTypes] = React.useState(null)
    const [loaded, setLoaded] = React.useState(false)

    function formatTime(time) {
        var dt = new Date(time)
        return (
            !dt.getTime() > 0 ? " " : moment(time).format('HH:mm')
        )
    }

    function displayExistingShiftTypes() {
        if (loaded) {
        return (<div>
        <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead className={classes.tableHead}>
            <TableRow className={classes.tableHeadCell}>
              <TableCell className={classes.tableHeadCell}>Shift Type Name</TableCell>
              <TableCell className={classes.tableHeadCell}>Start Time</TableCell>
              <TableCell className={classes.tableHeadCell}>End Time</TableCell>
              
              <TableCell className={classes.tableHeadCell}>Break 1 Start</TableCell>
              <TableCell className={classes.tableHeadCell}>Break 1 End</TableCell>
              
              <TableCell className={classes.tableHeadCell}>Break 2 Start</TableCell>
              <TableCell className={classes.tableHeadCell}>Break 2 End</TableCell>
              
              <TableCell className={classes.tableHeadCell}>Break 3 Start</TableCell>
              <TableCell className={classes.tableHeadCell}>Break 3 End</TableCell>
            
              <TableCell className={classes.tableHeadCell}>Delete</TableCell>
            
            </TableRow>
          </TableHead>
          <TableBody>
            {shiftTypes.map((shiftType) => (
              <TableRow key={shiftType.id}>
                
                <TableCell component="th" scope="row" className={classes.tableHeadCell}>
                  {shiftType.shift_type_name}
                </TableCell>
                
                <TableCell align="left">
                    {formatTime(shiftType.shift_start_time)}
                </TableCell>
                <TableCell align="left">
                    {formatTime(shiftType.shift_end_time)}
                </TableCell>
               
                <TableCell align="left">
                    {formatTime(shiftType.break_1_start)}
                </TableCell>
                <TableCell align="left">
                    {formatTime(shiftType.break_1_end)}
                </TableCell>
                
                <TableCell align="left">
                    {formatTime(shiftType.break_2_start)}
                </TableCell>
                <TableCell align="left">
                    {formatTime(shiftType.break_2_end)}
                </TableCell>
                
                <TableCell align="left">
                    {formatTime(shiftType.break_3_start)}
                </TableCell>
                <TableCell align="left">
                    {formatTime(shiftType.break_3_end)}
                </TableCell>
                
                <TableCell align="left">
                    <IconButton onClick={() => handleDeleteShiftType(shiftType.id)}> 
                        <DeleteIcon />
                    </ IconButton>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </div>
        )
    } else {
        return (
            <div>
            <CircularProgress />
            </div>
        )

    }
}

    // Add function to handle deletion of shift types on click
    const handleDeleteShiftType = (shift_id) => {
        fetch('/api/delete-shift-type/' + shift_id, 
              {method: 'POST'})
              .then(() => {
                fetchShiftTypes()
                })
              .then(() => {
                  notifyDelete()
                  setPlotUUID(uuidv4()) 
              });

    };

    const notifyDelete = () => toast.success('Shift Type Deleted', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    // Add states required for creation of shifts
    const [createShiftTypeModalOpen, setCreateShiftTypeModalOpen] = React.useState(false);

    const handleOpenCreateShiftTypeDialog = (() => {
        setCreateShiftTypeModalOpen(true);
    })

    const handleDiscardShiftTypeDialog = (() => {
        setCreateShiftTypeModalOpen(false);
        
        // If discard button is clicked, return all state variables to their defaults

        setShiftTypeName('');

        handleTimeStartChange(DefaultTime);
        handleTimeEndChange(DefaultTime);

        handleBreak1StartChange(null);
        handleBreak2StartChange(null);
        handleBreak3StartChange(null);
        handleBreak1EndChange(null);
        handleBreak2EndChange(null);
        handleBreak3EndChange(null);

        // TODO: Make number of breaks switch back to 0 on discard
        // This is harder to reset than the others because of the 
        // use of the reducer!

    })

    const handleCloseCreateShiftTypeDialog = (() => {
        setCreateShiftTypeModalOpen(false);
    })

    const DefaultTime = new Date("January 1 2021 12:00");

    const [shiftTypeName, setShiftTypeName] = useState('');

    function handleShiftTypeNameChange(e) {
        setShiftTypeName(e.target.value);
    }

    const [selectedTimeStart, handleTimeStartChange] = useState(DefaultTime);
    const [selectedTimeEnd, handleTimeEndChange] = useState(DefaultTime);  

    // TODO: Now that there is a state variable for tracking the number of breaks
    // it may be possible to replace the blow with DefaultTime as well instead of
    // null, which slightly improves the user experience of the time picker 

    // Break 1
    const [break1TimeStart, handleBreak1StartChange] = useState(null);
    const [break1TimeEnd, handleBreak1EndChange] = useState(null);

    // Break 2
    const [break2TimeStart, handleBreak2StartChange] = useState(null);
    const [break2TimeEnd, handleBreak2EndChange] = useState(null);

    // Break 3
    const [break3TimeStart, handleBreak3StartChange] = useState(null);
    const [break3TimeEnd, handleBreak3EndChange] = useState(null);


    // Control number of breaks
    // Needs to use a reducer rather than a simple state, hence why this is all a bit complex
    // From https://reactjs.org/docs/hooks-reference.html

    const numberOfBreaksInitial = {numberOfBreaks: 0};

    function reducer(state, action) {
        switch (action.type) {
          case 'increment':
            return {numberOfBreaks: state.numberOfBreaks + 1};
          case 'decrement':
              if (state.numberOfBreaks == 1){
                handleBreak1StartChange(null);
                handleBreak1EndChange(null);
              }
              if (state.numberOfBreaks == 2){
                handleBreak2StartChange(null);
                handleBreak2EndChange(null);
              }
              if (state.numberOfBreaks == 3){
                handleBreak3StartChange(null);
                handleBreak3EndChange(null);
              }

            return {numberOfBreaks: state.numberOfBreaks - 1};
          default:
            throw new Error();
        }
      }
    
    const [stateBreaks, dispatch] = useReducer(reducer, numberOfBreaksInitial);




    // Handle Submit
    // TODO: Set all form values back to defaults
    function handleConfirmCreateShiftType(e) {
        let headers = getHeaders()

        // Need to convert any null time values to string
        // They need to be null for the frontend so the time picker can work with the defaults
        // while still being easily identifiable as unset, but the POST request is expecting
        // all of the datetimes to be returned as strings, so provide a blank string if no
        // time selected 
        const requestOptions = {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                shift_type_name: shiftTypeName,
                shift_start_time: selectedTimeStart,
                shift_end_time: selectedTimeEnd,
                break_1_start: break1TimeStart == null ? "null" : break1TimeStart,
                break_1_end: break1TimeEnd == null ? "null" : break1TimeEnd,
                break_2_start: break2TimeStart == null ? "null" : break2TimeStart,
                break_2_end: break2TimeEnd == null ? "null" : break2TimeEnd,
                break_3_start: break3TimeStart == null ? "null" : break3TimeStart,
                break_3_end: break3TimeEnd == null ? "null" : break3TimeEnd,
            })
        };
        console.log(requestOptions)
        fetch('/api/create-shift-type', requestOptions).then((response) => {
            if (response.ok) {
                console.log("Shift type created successfully")
                setCreateShiftTypeModalOpen(false)
                fetchShiftTypes()
                setPlotUUID(uuidv4()) 
                
                // Reset Defaults for create shift type modal
                setShiftTypeName('');

                handleTimeStartChange(DefaultTime);
                handleTimeEndChange(DefaultTime);
        
                handleBreak1StartChange(null);
                handleBreak2StartChange(null);
                handleBreak3StartChange(null);
                handleBreak1EndChange(null);
                handleBreak2EndChange(null);
                handleBreak3EndChange(null);

                // TO DO: Also reset number of breaks
                // This is harder because of the use of the reducer
        

            } else {
                console.log("Error creating shift type")
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }
    


    // Determine what will run on page load
    // Get notes from server
    useEffect(() => {
        fetchShiftTypes()
         
    }, []);


    // Rendering of page

    return (
        <div>
            
            <Typography variant="h4"> Shift Types </Typography>
            <Typography variant="body1"> 
                Here you can add new shift types, review existing shift types, or delete existing shift types.
            </Typography>
            <br />
            <Button variant="contained" color="primary" onClick={handleOpenCreateShiftTypeDialog}> 
                Add a new shift type 
            </Button>
                <Dialog
                    open={createShiftTypeModalOpen}
                    onClose={handleCloseCreateShiftTypeDialog}
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
                            Create a new shift type
                        </DialogTitle>
                    </Grid>
                    <Grid item xs={6} align="right">
                        <IconButton onClick={handleCloseCreateShiftTypeDialog} >
                            <CancelIcon />
                        </IconButton>
                    </Grid>
                
                    <Grid item xs={12}>
                        <DialogContentText>
                            You will be able to select this shift type when setting up a rota.
                        </DialogContentText>
                    </Grid>
                
                    <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        margin="dense"
                        id="shift-type-name"
                        label="Shift Type Name (e.g. Early, Late, Full Day, Long)"
                        type="text"
                        onChange={(e) => handleShiftTypeNameChange(e)}
                    />
                    <br /><br /><br />
                    </Grid>
                
            
                    <Grid item xs={12}>
                        <DialogContentText>
                            Shift Start and End
                        </DialogContentText>
                    </Grid>
                
                
                    <Grid item xs={6}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <TimePicker 
                                required
                                label="Shift Start Time" 
                                value={selectedTimeStart} 
                                onChange={handleTimeStartChange} 
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={6}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <TimePicker 
                                required
                                label="Shift End Time" 
                                value={selectedTimeEnd} 
                                onChange={handleTimeEndChange} 
                            />
                        </MuiPickersUtilsProvider>
                        <br /><br /><br />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Divider />
                        <br />
                    </Grid>

                    <Grid item xs={12}>
                                <Typography variant="h5">
                                    Breaktimes
                                </Typography>
                            </Grid>

                    <Grid item xs={6}>
                        <DialogContentText> Select Number of Breaks <br></br> (Maximum of 3) </DialogContentText>
                    </Grid>
                    <Grid item xs={6}>
                        <ButtonGroup>
                            {stateBreaks.numberOfBreaks == 0 ?
                            <Button
                            variant="contained"
                            disabled> 
                                -
                            </Button>
                            :
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={() => dispatch({type: 'decrement'})} > 
                            - 
                            </Button>
                            }
                            
                            <Typography variant="h6" align="center"> {stateBreaks.numberOfBreaks} </Typography>
                            
                            {stateBreaks.numberOfBreaks == 3 ?
                                <Button
                                variant="contained"
                                disabled> 
                                    +
                                </Button>
                                :
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => dispatch({type: 'increment'})}    
                                > 
                                + 
                                </Button>
                                }
                        </ButtonGroup>
                    </Grid>

                </Grid>


                {stateBreaks.numberOfBreaks >= 1 ? 
                <div>
                        <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
                        <Grid item xs={6}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <TimePicker 
                                    label="Break 1 Start Time" 
                                    value={break1TimeStart} 
                                    onChange={handleBreak1StartChange} 
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <TimePicker 
                                    label="Break 1 End Time" 
                                    value={break1TimeEnd} 
                                    onChange={handleBreak1EndChange} 
                                />
                            </MuiPickersUtilsProvider>
                            <br />
                        </Grid>
                    </Grid>
                </div>
                :
                false}

                {stateBreaks.numberOfBreaks >= 2 ? 
                <div>
                        <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
                        <Grid item xs={6}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <TimePicker 
                                    label="Break 2 Start Time" 
                                    value={break2TimeStart} 
                                    onChange={handleBreak2StartChange} 
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <TimePicker 
                                    label="Break 2 End Time" 
                                    value={break2TimeEnd} 
                                    onChange={handleBreak2EndChange} 
                                />
                            </MuiPickersUtilsProvider>
                            <br />
                        </Grid>
                    </Grid>
                </div>
                :
                false}

                {stateBreaks.numberOfBreaks == 3 ? 
                <div>
                        <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
                        <Grid item xs={6}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <TimePicker 
                                    label="Break 3 Start Time" 
                                    value={break3TimeStart} 
                                    onChange={handleBreak3StartChange} 
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <TimePicker 
                                    label="Break 3 End Time" 
                                    value={break3TimeEnd} 
                                    onChange={handleBreak3EndChange} 
                                />
                            </MuiPickersUtilsProvider>
                            <br /><br /><br />
                        </Grid>
                    </Grid>
                </div>
                :
                false}


                <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
                    <Grid item xs={12}>
                        <ButtonGroup disableElevation variant="contained" color="primary" fullWidth>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={handleDiscardShiftTypeDialog}
                            >
                                Discard
                            </Button>

                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={handleConfirmCreateShiftType}
                            >
                                Confirm
                            </Button>
                        </ButtonGroup>
                        
                    </Grid>
                </Grid>
            </Box>  


        </Dialog>
        <br /><br /><br />
        {displayExistingShiftTypes()}

        <br /><br /><br />
        <div key={plotUUID}>
            <PlotlyPlot api_url="/api/own-shift-types-plot" />            
        </div>
        </div>



    )
} 

