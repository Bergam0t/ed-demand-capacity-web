import React, { Component, useEffect} from "react";
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

  import { useStoreState } from 'easy-peasy';
  import { toast } from 'react-toastify';

export default function Notes() {

    const [notes, setNotes] = React.useState('');
    const [notesEditable, setNotesEditable] = React.useState(false);

    const loggedIn = useStoreState(state => state.loggedIn)

    function fetchNotes() {
        return fetch('api/notes')
            // Make sure to not wrap this first then statement in {}
            // otherwise it returns a promise instead of the json
            // and then you can't access the email attribute 
            .then(response => 
                response.json()
            )
            .then((json) => {
                setNotes(json["notes"]);
                // console.log(json)
            });
    }

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

    function handleSubmit() {
        let headers = getHeaders()

        // setNotes(notesFieldRef.current)

        const requestOptions = {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                notes: notes
            })
        };
        fetch('/api/notes', requestOptions).then((response) => {
            if (response.ok) {
                console.log("Notes updated successfully")
                setNotesEditable(false);
                notify();
            } else {
                console.log("Error updating notes")
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const notify = () => toast.success('Notes successfully updated', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    // Get notes from server
    useEffect(() => {
        fetchNotes()
    }, []);




    return (
        <Grid container>

        <Grid item xs={12}>
            <Typography variant="h3"> 
                Notes
            </Typography>
        </Grid>


        {notesEditable ? 
        
        // Editable notes
        <Grid item xs={8}>
            <TextField
                value={notes}
                multiline
                rows={10}
                fullWidth
                variant="filled"
                style={{ width: "100%" }}
                onChange={(e) => setNotes(e.target.value)}
            />
            <br /><br />
            <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleSubmit()}> 
                Submit 
            </Button>
        </Grid>   
        
        :
        
        // Notes in read-only state
        <Grid item xs={8}>
        <TextField
            value={notes}
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