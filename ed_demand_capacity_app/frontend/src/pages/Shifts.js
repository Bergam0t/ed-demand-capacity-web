import React, { Component, useState,  } from "react";
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    CardContent,
    Modal,
    ButtonGroup,
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

    })
);

// const muiDialogTheme = createMuiTheme({
//     overrides: {
//           paper: {
//             borderTopLeftRadius: '4px',
//             borderTopRightRadius: '4px'
//           }
        
//       }
// })

export default function ShiftPage() {

    // Function for getting existing shift types associated with this session
    // const getExistingShiftTypes = () => {
        
    //   };

    // Functions to run on component load
    // useEffect(() => {

    //   }, [])

    const classes = useStyles();

    const [createShiftTypeModalOpen, setCreateShiftTypeModalOpen] = React.useState(false);

    const handleOpenCreateShiftTypeDialog = (() => {
        setCreateShiftTypeModalOpen(true);
    })

    const handleCloseCreateShiftTypeDialog = (() => {
        setCreateShiftTypeModalOpen(false);
    })

    const DefaultTime = new Date("January 1 2021 12:00");

    const [selectedTimeStart, handleTimeStartChange] = useState(DefaultTime);
    const [selectedTimeEnd, handleTimeEndChange] = useState(DefaultTime);

    // Number of breaks
    const [numberOfBreaks, handleNumberBreaksChange] = useState(3);

    // Break 1
    const [break1TimeStart, handleBreak1StartChange] = useState(null);
    const [break1TimeEnd, handleBreak1EndChange] = useState(null);

    // Break 2
    const [break2TimeStart, handleBreak2StartChange] = useState(null);
    const [break2TimeEnd, handleBreak2EndChange] = useState(null);

    // Break 3
    const [break3TimeStart, handleBreak3StartChange] = useState(null);
    const [break3TimeEnd, handleBreak3EndChange] = useState(null);

    // Handle Submit
    // TODO: Set all form values back to defaults
    // handleSubmit = (e) => {
    
    
    // }




    return (
        <div>
            
            <Typography variant="h4"> Shift Types </Typography>
            <Typography variant="body1"> 
                Here you can add new shift types, review existing shift types, or edit existing shift types.
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
                </Grid>
                
                    
                {numberOfBreaks >= 1 ? 
                <div>
                        <Grid container style={{paddingLeft: 20, paddingRight: 20, paddingBottom:20}}>
                        <Grid item xs={12}>
                            <DialogContentText>
                                Breaktimes
                            </DialogContentText>
                        </Grid>
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

                {numberOfBreaks >= 2 ? 
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

                {numberOfBreaks == 3 ? 
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
                                onClick={handleCloseCreateShiftTypeDialog}
                            >
                                Discard
                            </Button>

                            <Button 
                                variant="contained" 
                                color="primary"
                            >
                                Confirm
                            </Button>
                        </ButtonGroup>
                        
                    </Grid>
                </Grid>
            </Box>  


        </Dialog>

        </div>



    )
} 

