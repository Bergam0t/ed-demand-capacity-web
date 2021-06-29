import React, { Component, useEffect } from "react";
import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    CardContent,
    Modal,
    ButtonGroup,
    Divider
  } from '@material-ui/core';


// Get notes from 



export default function Notes() {

    const [notes, setNotes] = React.useState('');
    const [notesEditable, setNotesEditable] = React.useState(false);


    function fetchNotes() {
        return fetch('api/notes')
            // Make sure to not wrap this first then statement in {}
            // otherwise it returns a promise instead of the json
            // and then you can't access the email attribute 
            .then(response => 
                response.json()
            )
            .then((json) => {
                return json["notes"];
                // console.log(json)
            });
    }

    function handleSubmit() {

    }

    // Get notes from server
    useEffect(() => {
        fetchNotes()
        .then(response => {() => setNotes(response)})
    });


    return (
        <Grid container>

        <Grid item xs={12}>
            <Typography variant="h3"> 
                Notes
            </Typography>
        </Grid>


        {notesEditable ? 
        
        <Grid item xs={8}>
            <TextField
                multiline
                rows={10}
                fullWidth
                variant="filled"
                style={{ width: "100%" }}
            />
            <br /><br />
            <Button 
                variant="contained" 
                color="primary"
                onClick={() => setNotesEditable(false)}> 
                Submit 
            </Button>
        </Grid>   
        
        :
        
        <Grid item xs={8}>
        <TextField
            multiline
            fullWidth
            variant="outlined"
            rows={10}
            InputProps={{
                readOnly: true,
              }}
            style={{ width: "100%" }}
        />
        <br /><br />
        <Button 
            variant="contained" 
            color="secondary"
            onClick={() => setNotesEditable(true)}> 
            Edit Notes 
        </Button>
        </Grid>    
        }
        
        

        </Grid>
    )
}