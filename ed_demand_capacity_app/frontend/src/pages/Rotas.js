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
import { useStoreState, useStoreActions } from 'easy-peasy';
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
    },

    })
);


export default function Rotas() {
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
     * Fetch a list of shift types from the API
     * Updates following states: shiftTypes, shiftTypesLoaded
     */
    return fetch('api/own-shift-types')
    // Make sure to not wrap this first then statement in {}
    // otherwise it returns a promise instead of the json
    // and then you can't access the email attribute 
    .then(response => 
        response.json()
    )
    .then((json) => {
        setShiftTypes(json);     
    })
    .then(() => setShiftTypesLoaded(true))
    };

    // Get rota entries

    const [rotaEntries, setRotaEntries] = React.useState(null);
    const [rotaEntriesLoaded, setRotaEntriesLoaded] = React.useState(null);

    const fetchRotaEntries = () => {
      /**
       * Fetch a list of rota entries from the API
       * Updates following states: rotaEntries, rotaEntriesLoaded
       */
      return fetch('api/own-rota-entries-detailed')
      // Make sure to not wrap this first then statement in {}
      // otherwise it returns a promise instead of the json
      // and then you can't access the email attribute 
      .then(response => 
          response.json()
      )
      .then((json) => {
          setRotaEntries(json);
          
      })
      .then(() => setRotaEntriesLoaded(true))
      };


  // --------------------------- //
  // Handling rota start day
  // --------------------------- //
  // const [rotaStartDate, setRotaStartDate] = React.useState(new Date())
  // const [rotaEndDate, setRotaEndDate] = React.useState(addDays(new Date(), 7))

  const rotaStartDate = useStoreState(state => state.startDatePeriodOfInterest)
  const setStartDatePeriodOfInterest = useStoreActions((actions) => actions.setStartDatePeriodOfInterest);
  const fetchInitialPeriodOfInterest = useStoreActions((actions) => actions.fetchInitialPeriodOfInterest);

  const handleDateChangeStart = (date) => {
    
    let headers = getHeaders()

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        start_date: date
      })
    };

    console.log(requestOptions)

    fetch('/api/view-or-update-scenarios', requestOptions).then((response) => {
        if (response.ok) {
            console.log("Start date of period of interest set")
            setStartDatePeriodOfInterest(date.toDateString());
        } else {
            console.log("Error updating date of interest for scenario")
        }
    })
    .catch((error) => {
        console.log(error);
  });

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

  // Handle resource type
  const [resourceType, setResourceType] = useState('core');



  // Deal with shift selection (the 'rota' part)
  // State variable for managing changes to daily shifts during creation
  const [rotaData, setRotaData] = React.useState([])

  function initialiseRotaDefaults() {
    /**
     * Set state for role type defaults that will be displayed in the dialog box
     */

    var rota_array_initial = [
       {day: 'Previous', shift_type: 0},
       {day: 'Monday', shift_type: 0},
       {day: 'Tuesday', shift_type: 0},
       {day: 'Wednesday', shift_type: 0},
       {day: 'Thursday', shift_type: 0},
       {day: 'Friday', shift_type: 0},
       {day: 'Saturday', shift_type: 0},
       {day: 'Sunday', shift_type: 0}
      ]
    
    setRotaData(rota_array_initial)
    console.log(rotaData)
  }

  function handleChangeShift(day, event) {
      /**
       * Handle changes to the number of decisions per hour in the dialog box
       */

      // Create a copy of the rota data (this is syntax for deep copy rather than shallow)
      const shiftDataItems = JSON.parse(JSON.stringify(rotaData));

      for (const j in shiftDataItems) {
          if (shiftDataItems[j].day == day) {
              // Update the time for decision value with what has been
              // entered in the textinput field
              // Need to parse as float, not int, as want to allow decimal decisions per hour
              shiftDataItems[j].shift_type = event
          }
      }

    // Update the stream state with the new list
    setRotaData(shiftDataItems);
}


  // Rendering of the rota entry modal
  const [addRotaEntryOpen, setAddRotaEntryOpen] = React.useState(false)

  function displayShiftTypeSelection() {
    if (roleTypesLoaded && shiftTypesLoaded) {
      return (
         
          <Grid container spacing={2} style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>     
        {rotaData.map((day) => {
          return(
            <Grid container spacing={2}>  
            <Grid item xs={4}>
              <Typography variant="h6">      
                {day.day}
              </Typography>
            </Grid>
          
            <Grid item xs={8}>
              <Select
                labelId={"select-" + day.day + "shift-label"}
                id={"select-" + day.day + "shift"}
                value={day.shift_type}
                label={day.day}
                onChange={(e) => handleChangeShift(day.day, e.target.value)}
                fullWidth
              >
                <MenuItem key={0} value={0}>Shift Unfilled</MenuItem>
              {(shiftTypes || []).map((shift) => {
                return <MenuItem key={shift.id} value={shift.id}>{shift.shift_type_name}</MenuItem>
              })}
              </Select>
              <br /> <br /> 
            </Grid>
            
            </Grid> 
          )
        }
        )}
        </Grid>
        
      )
    } else {
      return (
        <div>
            <CircularProgress />
        </div>
        )
    }
  }

  function getDayValue(day) {
    for (const i in rotaData) {
      if (rotaData[i].day == day) {
        if (rotaData[i].shift_type != 0) {
          return (
            rotaData[i].shift_type
          )
          } else {
            return null
          }
      }
    }
  }

  function handleConfirmCreateRotaEntry(e) {
    /**
     * Handle Submit
     * 
     * TODO: 
     * Set all form values back to default
     */
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
            role_type: role,
            resource_name: resourceName,
            resource_type: resourceType,
            prev_week: getDayValue("Previous"),
            monday: getDayValue("Monday"),
            tuesday: getDayValue("Tuesday"),
            wednesday: getDayValue("Wednesday"),
            thursday: getDayValue("Thursday"),
            friday: getDayValue("Friday"),
            saturday: getDayValue("Saturday"),
            sunday: getDayValue("Sunday"),
        })
    };

    console.log(requestOptions)

    fetch('/api/create-rota-entry', requestOptions).then((response) => {
        if (response.ok) {
            console.log("Rota Entry created successfully")
            setAddRotaEntryOpen(false)
            fetchRotaEntries()
            // Clear out modal data
            setRota([])
            setRole('')
            setResourceName('')
        } else {
            console.log("Error creating rota entry")
        }
    })
    .catch((error) => {
        console.log(error);
    });
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
                  Here you can specify the shifts that an individual resource (i.e. a medic making clinical decisions) will be working in a given week.
              </DialogContentText>
            </Grid>

            <Grid item xs={10}>
                    <TextField
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



            {/* <Grid container> */}
                <Grid item xs={10}>
                  <InputLabel id="select-label">Role</InputLabel>
                  <Select
                    required
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
              {/* </Grid> */}

              <Grid item xs={10}>
                  <InputLabel id="select-label">Resource Type</InputLabel>
                  <Select
                    labelId="select-resource-type"
                    id="select-resource-type"
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    fullWidth
                  >
                  <MenuItem key="core" value="core">Core</MenuItem>
                  <MenuItem key="ad hoc" value="ad hoc">Ad-Hoc</MenuItem>
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
            

            {displayShiftTypeSelection()}

            <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
              <Grid item xs={12}>
                  <ButtonGroup disableElevation variant="contained" color="primary" fullWidth>
                      <Button 
                          variant="contained" 
                          color="secondary" 
                          onClick={() => setAddRotaEntryOpen(false)}
                      >
                          Discard
                      </Button>

                      <Button 
                          variant="contained" 
                          color="primary"
                          onClick={handleConfirmCreateRotaEntry}
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
    )
  }


  const handleDeleteRotaEntry = (rota_entry_id) => {
    fetch('/api/delete-rota-entry/' + rota_entry_id, 
        {method: 'POST'})
        .then(() => {
            fetchRotaEntries()
            })
        .then(() => {
            notifyDelete()
        });

};

    // Function to create toast notification when role type successfully deleted
    const notifyDelete = () => toast.success('Rota Entry Deleted', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
  });

  function tryGetShift(shiftEntryRota) {
    try {
      return (shiftEntryRota.shift_type_name)
    } 
    catch(err) {
      return ("-")
    }
  }

  function displayRotaEntries() {
    if (rotaEntriesLoaded && shiftTypesLoaded && roleTypesLoaded) {

      var rotaDays = ["Previous", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

      return (
        <div>
            <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
            
                <TableHead className={classes.tableHead}>
                    <TableRow className={classes.tableHeadCell}>
                    <TableCell className={classes.tableHeadCell}>Role</TableCell>
                    <TableCell className={classes.tableHeadCell}>Resource Name</TableCell>
                    <TableCell className={classes.tableHeadCell}>Type</TableCell>
                    {rotaDays.map((day) => (

                        <TableCell className={classes.tableHeadCell}>{day}</TableCell>
                    ))}
                    
                        <TableCell className={classes.tableHeadCell}>Delete</TableCell>
                    
                    </TableRow>
                </TableHead>
            
            <TableBody>
                
                
                {/* // Note that the usage of curly brackets vs brackets are important here!
                // If you replace the outer two sets of brackets with curly brackets, no values return.   */}
                {rotaEntries.map((rotaEntry) => (
                    <TableRow key={rotaEntry.id}> 
                    <TableCell>{rotaEntry.role_type.role_name}</TableCell> 
                    <TableCell>{rotaEntry.resource_name}</TableCell> 
                    <TableCell>{rotaEntry.resource_type.toUpperCase()}</TableCell> 
                    {/* This doesn't appear to work if passing week days programatically so 
                    have passed manually */}
                    <TableCell>{tryGetShift(rotaEntry.prev_week)}</TableCell>
                    <TableCell>{tryGetShift(rotaEntry.monday)}</TableCell>
                    <TableCell>{tryGetShift(rotaEntry.tuesday)}</TableCell>
                    <TableCell>{tryGetShift(rotaEntry.wednesday)}</TableCell>
                    <TableCell>{tryGetShift(rotaEntry.thursday)}</TableCell>
                    <TableCell>{tryGetShift(rotaEntry.friday)}</TableCell>
                    <TableCell>{tryGetShift(rotaEntry.saturday)}</TableCell>
                    <TableCell>{tryGetShift(rotaEntry.sunday)}</TableCell>


                <TableCell align="left">
                <IconButton onClick={() => handleDeleteRotaEntry(rotaEntry.id)}> 
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


  // Functions to run on page load
  useEffect(() => {
    fetchRoleTypes()
    fetchShiftTypes()
    fetchRotaEntries()
    fetchInitialPeriodOfInterest()
    }, []
  );
  
  // Initialise a second useEffect call that will run on page load
  useEffect(() => {
        initialiseRotaDefaults()
    // Have to include the value in brackets to avoid infinite loop
    // Means will only run the setState call when addRotaEntryOpen changes
    }, [addRotaEntryOpen]
  );

  // https://stackoverflow.com/questions/49491569/disable-specific-days-in-material-ui-calendar-in-react
  function disableAllBarMonday(date) {
    return date.getDay() === 0 || date.getDay() === 6 || date.getDay() === 2 || date.getDay() === 3 || date.getDay() === 4 || date.getDay() === 5;
  }

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
            shouldDisableDate={disableAllBarMonday}
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
            
          <br /> <br />

          {displayRotaEntries()}

    </div>
    )
}