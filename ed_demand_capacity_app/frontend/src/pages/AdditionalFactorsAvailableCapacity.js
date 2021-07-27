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

import DeleteIcon from '@material-ui/icons/Delete';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactPlayer from "react-player"


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


export default function EDSettings() {

    const classes = useStyles();

    const loggedIn = useStoreState(state => state.loggedIn)

    // Initialise state for determining whether the page has finished loading
    const [loaded, setloaded] = React.useState(false)

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


    return (
        <div>
        <Typography variant="h3">
            Additional Factors Affecting Available Capacity
        </Typography>

        <Typography variant="h6">
            Here you can add additional factors that may affect your available capacity (in terms of decisions per hour) in the week.
            <br /><br />
            These may be 
            <br />
            - allowing for staff breaks if you are unable to specify a breaktime in the shift pattern
            <br />
            - allowing for whole-staff training 
            
        </Typography>
        </div>
        )

    }
