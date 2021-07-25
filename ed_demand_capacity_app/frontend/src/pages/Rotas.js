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
    Select,
    MenuItem,
    InputLabel
  } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import { useStoreActions } from 'easy-peasy';
import {useStoreState} from 'easy-peasy';
import { makeStyles} from '@material-ui/core/styles';

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
  KeyboardDatePicker
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
import {addDays} from 'date-fns';
import 'date-fns';
import Tooltip from '@material-ui/core/Tooltip';
import HelpIcon from '@material-ui/icons/Help';


const useStyles = makeStyles((theme) => ({

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
     },
     
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

    tooltip: {
      fontSize: "1em",
    }

    })
);


export default function Rotas() {
  const classes = useStyles();

  // Get Role Types

  const [roleTypes, setRoleTypes] = React.useState(null);
  const [roleTypesLoaded, setRoleTypesLoaded] = React.useState(null);


  const fetchRoleTypes = () => {
    /**
     * Fetch a list of role types from the API
     * Updates following states: roleTypes, roleTypesLoaded
     */
    return fetch('api/own-role-types')
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

          let fa = a.role_name.toLowerCase(),
              fb = b.role_name.toLowerCase();

          if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
         }).slice()
        setRoleTypes(sorted_json);
        
    })
    .then(() => setRoleTypesLoaded(true))
    };


    // Get Shift Types
    
  const [shiftTypes, setShiftTypes] = React.useState(null);
  const [shiftTypesLoaded, setShiftTypesLoaded] = React.useState(null);


  const fetchShiftTypes = () => {
    /**
     * Fetch a list of streams from the API
     * Sorts streams by priority
     * Updates following states: streams, streamsOriginal, streamsLoaded
     */
    return fetch('api/own-shift-types')
    // Make sure to not wrap this first then statement in {}
    // otherwise it returns a promise instead of the json
    // and then you can't access the email attribute 
    .then(response => 
        response.json()
    )
    .then((json) => {
        // Sort the returned states by priority
        // From https://www.javascripttutorial.net/array/javascript-sort-an-array-of-objects/
        //  const sorted_json = json.sort((a, b) => {
        //      return a.stream_priority - b.stream_priority
        //  }).slice()
        setShiftTypes(json);
        
    })
    .then(() => setShiftTypesLoaded(true))
    };



  // Handling rota start day
  const [rotaStartDate, setRotaStartDate] = React.useState(new Date())
  const [rotaEndDate, setRotaEndDate] = React.useState(addDays(new Date(), 7))

  const handleDateChangeStart = (date) => {
    setRotaStartDate(date);
    setRotaEndDate(addDays(date, 7))
  };

  // ---------------------------------------- //
  // Rota entry modal
  // ---------------------------------------- //

  // Handle resource name
  const [resourceName, setResourceName] = useState('');

  function handleResourceNameChange(e) {
      setResourceName(e.target.value);
  }

  // Handle role selection
  const [role, setRole] = useState('');


  // Deal with shift selection (the 'rota' part)
  // State variable for managing changes to daily shifts during creation
  const [rotaData, setRotaData] = React.useState([])

  function initialiseRotaDefaults() {
    /**
     * Set state for role type defaults that will be displayed in the dialog box
     */

    var rota_array_initial = [
       {day: 'prev_week', shift_type: 0},
       {day: 'monday', shift_type: 0},
       {day: 'tuesday', shift_type: 0},
       {day: 'wednesday', shift_type: 0},
       {day: 'thursday', shift_type: 0},
       {day: 'friday', shift_type: 0},
       {day: 'saturday', shift_type: 0},
       {day: 'sunday', shift_type: 0}
      ]
    
    setRotaData(rota_array_initial)
  }

  function handleChangeShift(day, event) {
      /**
       * Handle changes to the number of decisions per hour in the dialog box
       */

      // Create a copy of the rota data (this is syntax for deep copy rather than shallow)
      const shiftDataItems = JSON.parse(JSON.stringify(rotaData));

      for (const j in roleTypeDataItems) {
          if (shiftDataItems[j].day == day) {
              // Update the time for decision value with what has been
              // entered in the textinput field
              // Need to parse as float, not int, as want to allow decimal decisions per hour
              roleTypeDataItems[j].decisions_per_hour = event.target.value
          }
      }

    // Update the stream state with the new list
    setRotaData(roleTypeDataItems);
}


  // Rendering of the rota entry modal
  const [addRotaEntryOpen, setAddRotaEntryOpen] = React.useState(false)

  function displayShiftTypeSelection() {
    if (roleTypesLoaded && shiftTypesLoaded) {
      return (
        <div>
          <Typography> TESTING </Typography>
        <Grid container spacing={2} align="center">
        {rotaData.map((day, index) => {
          // {console.log(day.day)}
          <div>
          <Grid item xs={4}>
          <Typography variant="h6">
            {day.day.toUpper()}
          </Typography>
        </Grid>
        
        {/* <Grid item xs={8}>
          <Select
            labelId={"select-" + day.day + "shift-label"}
            id={"select-" + day.day + "shift"}
            value={day.shift_type}
            label={day.day.toUpperCase()}
            onChange={(e) => handleChangeShift(day.day, e.target.value)}
            fullWidth
          >

            <MenuItem key={0} value={0}>Shift Unfilled</MenuItem>
          {(shiftTypes || []).map((shift) => {
            return <MenuItem key={shift.id} value={shift.id}>{shift.shift_type_name}</MenuItem>
          })}
          </Select>
        </Grid> */}
      </div>
        }
        )}
        </Grid>
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

  function rotaEntryModal() {
    return (
      <div>
        <Dialog
        open={addRotaEntryOpen}
        onClose={() => setAddRotaEntryOpen(false)}
        classes={{
            root: classes.dialog,
            paper: classes.paper
        }}
        >
          <Box>  
          <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
            <Grid item xs={6} align="left">
              <DialogTitle>
                  Create a new rota entry
              </DialogTitle>
            </Grid>
            <Grid item xs={6} align="right">
              <IconButton onClick={() => setAddRotaEntryOpen(false)} >
                  <CancelIcon />
              </IconButton>
            </Grid>
        
            <Grid item xs={12}>
              <DialogContentText>
                  Here you can specify the shifts that an individual resource (i.e. a medic working on triage) will be working in a given week.
              </DialogContentText>
            </Grid>

            <Grid item xs={10}>
                    <TextField
                        required
                        fullWidth
                        margin="dense"
                        id="resource-name"
                        label="Resource Name (optional)"
                        type="text"
                        onChange={(e) => handleResourceNameChange(e)}
                    />
                    <br /><br /><br />
            </Grid>
            <Grid item xs={2}>
            <Tooltip 
              title="If you want to, you can record the name of the resource 
                    (e.g. Dr Jones) or use some other identifier."
              classes={{tooltip: classes.tooltip}}>
              <IconButton aria-label="delete">
                <HelpIcon />
              </IconButton>
            </Tooltip>
            </Grid>



            <Grid container>
                <Grid item xs={10}>
                  <InputLabel id="demo-simple-select-label">Role</InputLabel>
                  <Select
                    labelId="select-role"
                    id="select-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    fullWidth
                  >
                  {(roleTypes || []).map((role) => {
                    return <MenuItem key={role.id} value={role.id}>{role.role_name}</MenuItem>
                  })}
                  </Select>
                  <br /><br /><br />
                </Grid>
                <Grid item xs={2}>
                  <Tooltip 
                    title="Select the Role that the resource fills. 
                          This determines the number of decisions the resource can make per hour 
                          per stream. These are set in the 'Emergency Department Settings' tab."
                    classes={{tooltip: classes.tooltip}}>
                <IconButton aria-label="role-help">
                  <HelpIcon />
                </IconButton>
              </Tooltip>
              </Grid>
            </Grid>
          
    

            {/* <Grid container>
            
              <Grid item xs={4}>
                <Typography variant="h6">
                  Previous Week
                </Typography>
              </Grid>
              
              <Grid item xs={8}>
                <Select
                  labelId="select-prev-week-shift"
                  id="select-date-time-column"
                  value={prevWeek}
                  label="Previous Week"
                  onChange={(e) => setPrevWeek(e.target.value)}
                  fullWidth
                >

                  <MenuItem key={0} value={0}>Shift Unfilled</MenuItem>
                {(roleTypes || []).map((role) => {
                  return <MenuItem key={role.id} value={role.id}>{role.role_name}</MenuItem>
                })}
                </Select>
              </Grid>
            </Grid>*/}
            {displayShiftTypeSelection()}
          </Grid>
          </Box>
        </Dialog> 
      </div>
    )
  }


  // Functions to run on page load
  useEffect(() => {
    fetchRoleTypes()
    fetchShiftTypes()
  }, []
  );
  
      // Initialise a second useEffect call that will run on page load
      useEffect(() => {
        if (shiftTypesLoaded) {
            initialiseRotaDefaults()
        }
        // Have to include the value in brackets to avoid infinite loop
        // Means will only run the setState call when addRotaEntryOpen changes
    }, [addRotaEntryOpen])

  // Handle rendering
  return (
    <div>
        <Grid container style = {{paddingLeft: 30, paddingRight: 30, paddingBottom:10}} spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4"> Rotas </Typography>
            </Grid>
        </Grid>
        <Grid container>
        <MuiPickersUtilsProvider utils={DateFnsUtils}> 
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="dd/MM/yyyy"
            margin="normal"
            id="date-picker-inline"
            label="Start date for rota"
            value={rotaStartDate}
            onChange={handleDateChangeStart}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />
          </MuiPickersUtilsProvider>
        </Grid>

          <Button 
            variant="contained"
            color="primary"
            onClick={() => setAddRotaEntryOpen(true)}>
              Create new rota entry
          </Button>
          {rotaEntryModal()}

          
            

    </div>
    )
}