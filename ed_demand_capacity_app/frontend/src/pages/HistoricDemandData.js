import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    CardContent
  } from '@material-ui/core';
  import React, { Component } from "react";
  import Card from '@material-ui/core/Card';
//   import { makeStyles } from '@material-ui/core/styles';

//   const useStyles = makeStyles({
//     pos: {
//         marginBottom: 12,
//       },
//     });

  export default function HistoricDemandData() {

    //const classes = useStyles();

    return (
    <Grid container spacing={1}>
    
    <Grid container item xs={6}>
        <Card paddingBottom={4}>
            <CardContent>
            <Typography variant='h4'>
                Is your data in record format?
            </Typography>
            <Typography variant='h6'>
                <br/>
                Record format data means you have one row per patient. 
                <br/><br/>
                Your data needs to contain columns for arrival date, arrival time, and stream.
                <br/><br/>
            </Typography>
            <Button color="primary" variant="contained">
                Upload record-format data
            </Button>
            </CardContent>   
        </Card>
    </Grid>

    <Grid container item xs={6}>
        <Card paddingBottom={4}>
            <CardContent>
            <Typography variant='h4'>
                Is your data being imported from the Excel model?
            </Typography>
            <Typography variant='h6'>
                <br/>
                If you hvae previously filled in the Excel model, you can upload the Excel file
                to extract the historic data in it. 
                <br/><br/>
            </Typography>
            <Button color="primary" variant="contained">
                Upload Excel Model
            </Button>
            </CardContent>   
        </Card>
    </Grid>

    </Grid>
    );
    }