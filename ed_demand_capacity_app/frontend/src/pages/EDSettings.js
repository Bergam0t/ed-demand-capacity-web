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
import { DataGrid, GridRowsProp, GridColDef } from '@material-ui/data-grid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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

    const [orderEdited, setOrderEdited] = React.useState(false)


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
    const [streamsOriginal, setStreamsOriginal] = React.useState(null)

    const fetchStreams = () => {
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

                // The parse & stringify here is necessary to create a deep copy of the array
                // If we only make a shallow copy (either with [...sorted_json] or sorted_json.slice())
                // then the priority values will later get changed in both our working array and
                // the one we have stored as an 'original' array, which is not desirable behaviour.
                setStreamsOriginal(JSON.parse(JSON.stringify(sorted_json)));
            });
      };

    // Function to render the buttons to save or discard
    // changes to the ordering and timing of streams

    // Would be nice to add a check for the updated array being the same as the original
    // array and disabling the buttons in that case as well, but it's not entirely simple
    // to check arrays are equal in js (can't use == or ===) and it's only a minor QOL improvement
    // so not implementing now
    const saveOrDiscardButtons = () => {
        if (!orderEdited) {
            return (
            <ButtonGroup>
                <Button variant="contained" color="default" disabled> 
                    Save Changes <br />to Streams 
                </Button>
                <Button variant="contained" color="default" disabled> 
                    Discard Changes
                </Button>
            </ButtonGroup>
            
            )
        } else {
            return (
            <ButtonGroup>
                <Button variant="contained" color="primary" onClick={handleSaveChanges}> 
                    Save Changes <br />to Streams 
                </Button>
                <Button variant="contained" color="secondary" onClick={handleDiscardChanges}> 
                    Discard Changes
                </Button>
            </ButtonGroup>
            )
        }
    }

    // From https://github.com/colbyfayock/my-final-space-characters/blob/master/src/App.js
    // https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd
    function handleOnDragEnd(result) {
        // Prevent errors being fired if drop is out of bounds
        if (!result.destination) return;
        // console.log(result)

        // Persist ordering after dropping        
        const items = Array.from(streams);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update the priority field on the stream to reflect its new 
        // position in the list
        for (const i in items) {
            items[i].stream_priority = parseInt(i) + 1
        }

        // Update the stream state with the new list
        setStreams(items);
        // Make buttons for saving or discarding changes clickable
        setOrderEdited(true);

    }

    function handleChangeMinutesPerDecision(id, event) {
        const items = Array.from(streams);

        // Iterate through the array 
        for (const i in items) {
            // Check whether the item is the one we're looking for
            if (items[i].id == id) {
                // If so, update the time for decision value with what has been
                // entered in the textinput field
                items[i].time_for_decision = event.target.value
            }

        // Update the stream state with the new list
        setStreams(items);
        // Make buttons for saving or discarding changes clickable
        setOrderEdited(true);
        }
    }

    function handleDiscardChanges() {
        // Remove the 'edited' status so the buttons get disabled
        setOrderEdited(false);
        // Set the streams back 

        console.log("Original streams array: ", streamsOriginal)
        console.log("Edited streams array: ", streams)
        setStreams(streamsOriginal)
        console.log("Updated streams array: ", streams)
    }

    // Toast notification for successful changes to streams
    const notifySuccessStreams = () => toast.success('Changes to stream details saved', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    function handleSaveChanges() {

        let headers = getHeaders()

        const requestOptions = {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify({
                streams: streams
            })
        };
        console.log(requestOptions)

        // Update the streams on the server
        fetch('/api/update-stream-details', requestOptions)
            .then((response) => {
                if (response.ok) {
                    console.log("Stream details updated successfully")
                }
            })
            .then(() => {
                notifySuccessStreams()
                // Remove the 'edited' status so the buttons get disabled
                setOrderEdited(false);
                // Update the 'original' streams so that the current state is reverted back to
                // if discarding future changes
                // The parse & stringify here is necessary to create a deep copy of the array
                // If we only make a shallow copy (either with [...sorted_json] or sorted_json.slice())
                // then the priority values will later get changed in both our working array and
                // the one we have stored as an 'original' array, which is not desirable behaviour.
                setStreamsOriginal(JSON.parse(JSON.stringify(streams)));
            })
        
            }
        
    
    // From https://github.com/colbyfayock/my-final-space-characters/blob/master/src/App.js
    // https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd
    function displayStreams() {
        if (loaded) {
            return (
            <div>
                <Grid container spacing={2} align="center"> 
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="streams-list">
                    {(provided) => (
              <ul style={{listStyle:'none'}} className="streams-list" {...provided.droppableProps} ref={provided.innerRef}>
                {streams.map((stream, index) => {
                    // console.log(index)
                  return (
                    <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                      
                      {(provided) => (
                        <li  ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <br />
                            <Paper elevation={3} style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20, paddingTop:20}}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} align="left">
                                        <Typography variant="h5"> {stream.stream_name} </Typography> 
                                    </Grid>
                                        
                                        <Grid item xs={9} align="left">
                                            <TextField 
                                                value={stream.time_for_decision} 
                                                label='Minutes per Decision'
                                                inputProps={{size: 20}} 
                                                onChange={(e) => handleChangeMinutesPerDecision(stream.id, e)}
                                            />
                                        </Grid>
                                        <Grid item xs={3} align="right">
                                            <TextField 
                                                disabled 
                                                value={stream.stream_priority} 
                                                label='Priority'
                                                inputProps={{size: 5}} 
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            <br />
                        </li>
                      )}

                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
                </DragDropContext>
                </Grid>
            </div>)
        } else {
            return (
            <div>
            <CircularProgress />
            </div>
            )
        }
    }

    // From https://www.pluralsight.com/guides/dynamic-tables-from-editable-columns-in-react-html
    // const [inEditMode, setInEditMode] = useState({
    //     status: false,
    //     rowKey: null
    // })

    // const [priority, setPriority] = useState(null);

    // const [minutesForDecision, setMinutesForDecision] = useState(null);
    
    // const onEdit = ({id, currentPriority, currentMinutesForDecision}) => {
    //     setInEditMode({
    //         status: true,
    //         rowKey: id
    //     })
    //     setPriority(currentPriority);
    //     setMinutesForDecision(currentMinutesForDecision)
    // }

    // function displayStreams() {
    //     if (loaded) {
    //         return (<div>
    //         <TableContainer component={Paper}>
    //         <Table className={classes.table} aria-label="simple table">
    //             <TableHead className={classes.tableHead}>
    //             <TableRow className={classes.tableHeadCell}>
    //                 <TableCell className={classes.tableHeadCell}>Stream Name</TableCell>
    //                 <TableCell className={classes.tableHeadCell}>Priority</TableCell>
    //                 <TableCell className={classes.tableHeadCell}>Minutes for <br /> Decision</TableCell>
                
    //             </TableRow>
    //             </TableHead>
    //             <TableBody>
    //             {streams.map((stream) => (
    //                 <TableRow key={stream.id}>
                    
    //                 <TableCell component="th" scope="row" className={classes.tableHeadCell}>
    //                     {stream.stream_name}
    //                 </TableCell>
                    
    //                 <TableCell align="left">
    //                     <TextField
    //                     type = 'number'
    //                     value = {stream.stream_priority}
    //                     ={changeHandler}
    //                     />
    //                 </TableCell>
                    
    //                 <TableCell align="left">
    //                     <TextField 
    //                     type = 'number'
    //                     value = {stream.time_for_decision}
    //                     onChange={changeHandler}
    //                     />
    //                 </TableCell>

    //                 </TableRow>
    //             ))}
    //             </TableBody>
    //         </Table>
    //         </TableContainer>
    //         </div>
    //         )
    // } else {
    //     return (
    //         <div>
    //         <CircularProgress />
    //         </div>
    //         )

    //     }
    // }

    // function displayStreamsEditableDataGrid() {
    //     if (loaded) {

    //     const rows: GridRowsProp = [
            
    //         { id: 1, col1: 'Hello', col2: 'World' },
    //         { id: 2, col1: 'XGrid', col2: 'is Awesome' },
    //         { id: 3, col1: 'Material-UI', col2: 'is Amazing' },
    //         ];
            
    //         const columns
    //         { field: 'streamName', headerName: 'Steram Name', width: 150 },
    //         { field: 'priority', headerName: 'Priority', width: 150 },
    //         { field: 'minutesForDecision', headerName: 'Minutes for Decision', width: 150 },
    //         ];

    //     return (<div>
    //     <TableContainer component={Paper}>
    //     <Table className={classes.table} aria-label="simple table">
    //     <TableHead className={classes.tableHead}>
    //         <TableRow className={classes.tableHeadCell}>
    //         <TableCell className={classes.tableHeadCell}>Stream Name</TableCell>
    //         <TableCell className={classes.tableHeadCell}>Priority</TableCell>
    //         <TableCell className={classes.tableHeadCell}>Minutes for <br /> Decision</TableCell>
            
    //         </TableRow>
    //     </TableHead>
    //     <TableBody>
    //         {streams.map((stream) => (
    //         <TableRow key={stream.id}>
                
    //             <TableCell component="th" scope="row" className={classes.tableHeadCell}>
    //             {stream.stream_name}
    //             </TableCell>
                
    //             <TableCell align="left">
    //                 {stream.stream_priority}
    //             </TableCell>
                
    //             <TableCell align="left">
    //                 {stream.time_for_decision}
    //             </TableCell>

    //         </TableRow>
    //         ))}
    //     </TableBody>
    //     </Table>
    // </TableContainer>
    // </div>
    //     )
    // } else {
    //     return (
    //         <div>
    //         <CircularProgress />
    //         </div>
    //     )

    // }
    // }



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
                    <Typography variant="h5"> Stream Settings </Typography>
                    <br />
                <Typography variant="body1"> 
                    Here you can set the relative priority of streams and how long decisions take for different streams.
                    <br /> <br />
                    You can change the priority of the streams by dragging and dropping the cards below.               
                </Typography>
                <br />
                <Grid container align="center">
                <Grid item xs={12}>
                {saveOrDiscardButtons()}
                </Grid>
                <Grid item xs={11}>
                {displayStreams()}
                </Grid>
                </Grid> 
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