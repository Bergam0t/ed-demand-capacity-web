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
import { useStoreActions } from 'easy-peasy';
import {useStoreState} from 'easy-peasy';
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

export default function EDSettings() {

    const classes = useStyles();

    const loggedIn = useStoreState(state => state.loggedIn)

    const [loaded, setLoaded] = React.useState(false)

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


    const [roleTypes, setRoleTypes] = React.useState(null)

    // Add function for retrieving role types from the server
    // for this user session
    const fetchRoleTypes = () => {
        return fetch('api/own-role-types')
            // Make sure to not wrap this first then statement in {}
            // otherwise it returns a promise instead of the json
            // and then you can't access the email attribute 
            .then(response => 
                response.json()
            )
            .then((json) => {
                setRoleTypes(json);
                // console.log(json)
            });
      };

    
    
    const [streams, setStreams] = React.useState(null)

    const fetchStreams = () => {
        return fetch('api/get-historic-data-streams')
            // Make sure to not wrap this first then statement in {}
            // otherwise it returns a promise instead of the json
            // and then you can't access the email attribute 
            .then(response => 
                response.json()
            )
            .then((json) => {
                setStreams(json['streams']);
                // console.log(json)
            });
      };

    

    // Add function to handle deletion of role types on click
    const handleDeleteRoleType = (role_id) => {
        fetch('/api/delete-role-type/' + role_id, 
              {method: 'POST'})
              .then(() => {
                fetchRoleTypes()
                })
              .then(() => {
                  notifyDelete()
              });

    };

    const notifyDelete = () => toast.success('Role Type Deleted', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
   

    // Add states required for creation of role types
    const [createRoleTypeModalOpen, setCreateRoleTypeModalOpen] = React.useState(false);

    const handleOpenCreateRoleTypeDialog = (() => {
        setCreateRoleTypeModalOpen(true);
    })

    const handleCloseCreateRoleTypeDialog = (() => {
        setCreateRoleTypeModalOpen(false);
    })

    const [roleTypeName, setRoleTypeName] = useState('');

    function handleRoleTypeNameChange(e) {
        setRoleTypeName(e.target.value);
    }


    // Handle Submit
    // TODO: Set all form values back to defaults
    function handleConfirmCreateRoleType(e) {
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
                role_name: roleTypeName,
                decisions_per_hour_per_stream: JSON.stringify({}),
            })
        };
        console.log(requestOptions)
        fetch('/api/create-role-type', requestOptions).then((response) => {
            if (response.ok) {
                console.log("Role type created successfully")
                setCreateRoleTypeModalOpen(false)
                fetchRoleTypes()
            } else {
                console.log("Error creating role type")
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }
    


    // Determine what will run on page load
    // Get notes from server
    useEffect(() => {
        fetchStreams()
        .then(() => {fetchRoleTypes()})
        .then(() => {setLoaded(true)})
         
    }, []);

    // Rendering of page

    return (
        <div>
            
            <Grid container style = {{paddingLeft: 30, paddingRight: 30, paddingBottom:10}} spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h4"> Emergency Department Settings </Typography>
                </Grid>

            <Grid item xs={6}>
                <Paper className={classes.paper}>
                <Typography variant="body1"> 
                    Here you can set the relative priority of streams and how long decisions take for different streams.
                </Typography>
                </Paper>
            </Grid>

            <Grid item xs={6}>
                <Paper className={classes.paper}>
                <Typography variant="body1"> 
                    Here you can add new role types, review existing role types, or delete existing role types.
                </Typography>
                <br />
                <Button variant="contained" color="primary" onClick={handleOpenCreateRoleTypeDialog}> 
                    Add a new role type 
                </Button>
                </Paper>
                    <Dialog
                        open={createRoleTypeModalOpen}
                        onClose={handleCloseCreateRoleTypeDialog}
                        classes={{
                            root: classes.dialog,
                            paper: classes.paper
                        }}
                    >
                    <Box>  
                    <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
                        <Grid item xs={6} align="left">
                            <DialogTitle>
                                Create a new role type
                            </DialogTitle>
                        </Grid>
                        <Grid item xs={6} align="right">
                            <IconButton onClick={handleCloseCreateRoleTypeDialog} >
                                <CancelIcon />
                            </IconButton>
                        </Grid>
                    
                        <Grid item xs={12}>
                            <DialogContentText>
                                You will be able to select this role type when setting up a rota.
                            </DialogContentText>
                        </Grid>
                    
                        <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            margin="dense"
                            id="role-type-name"
                            label="Role Type Name (e.g. Consultant Resus, FY2 Minors, Band 5)"
                            type="text"
                            onChange={(e) => handleRoleTypeNameChange(e)}
                        />
                        <br /><br /><br />
                        </Grid>


                    <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
                        <Grid item xs={12}>
                            <ButtonGroup disableElevation variant="contained" color="primary" fullWidth>
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    onClick={handleCloseCreateRoleTypeDialog}
                                >
                                    Discard
                                </Button>

                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={handleConfirmCreateRoleType}
                                >
                                    Confirm
                                </Button>
                            </ButtonGroup>
                            
                        </Grid>

                    </Grid>
                </Grid>
                

                </Box>
                </Dialog>
                </Grid>
                </Grid>

                </div>
        );

    }