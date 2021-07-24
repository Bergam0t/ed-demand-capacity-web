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
     }

    })
);


export default function Rotas() {
  // Get Role Types

  const [roleTypes, setRoleTypes] = React.useState(null);
  const [roleTypesLoaded, setRoleTypesLoaded] = React.useState(null);


  const fetchStreams = () => {
    /**
     * Fetch a list of streams from the API
     * Sorts streams by priority
     * Updates following states: streams, streamsOriginal, streamsLoaded
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
        //  const sorted_json = json.sort((a, b) => {
        //      return a.stream_priority - b.stream_priority
        //  }).slice()
        setRoleTypes(json);
        
    })
    .then(() => setRoleTypesLoaded(true))
    };



  // Handling rota start day
  const [rotaStartDate, setRotaStartDate] = React.useState(new Date())
  const [rotaEndDate, setRotaEndDate] = React.useState(addDays(new Date(), 7))

  const handleDateChangeStart = (date) => {
    setRotaStartDate(date);
    setRotaEndDate(addDays(date, 7))
  };


  // Rota entry modal
  const [addRotaEntryOpen, setAddRotaEntryOpen] = React.useState(false)

  useEffect(() =>
    fetchStreams(), []
  )
  

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

          
            

    </div>
    )
}