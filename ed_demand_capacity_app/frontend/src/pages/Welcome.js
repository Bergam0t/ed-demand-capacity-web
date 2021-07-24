import React from "react";
import ReactPlayer from "react-player"
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Typography, Link, Button, ButtonGroup, Card, CardContent, Box } from '@material-ui/core';

const useStyles = makeStyles({
    styledLink: {
        fontWeight: 'bold'
    },
    redPaper: {
        backgroundColor: '#ffa9a3',
        overflow: "hidden",
        // margin: "10px",
        maxHeight: "none",
        padding: "10px",
        borderRadius: "4px",
    },
    paper: {
        overflow: "hidden",
        // margin: "10px",
        maxHeight: "none",
        padding: "10px",
        // borderRadius: "4px",
        elevation: 6,
        variant: "elevation"
    },
    card: {
        padding: "10px",
        border: "2px solid",
        boxShadow: 2,
    }
  });

export default function GettingStarted() {
    const classes = useStyles();

    return (
        <div>
        <Typography variant="h6">
        Welcome to the NHS EI demand and capacity model.
        <br /> <br />
        This is a prototype of a web-based version of the model that is available&nbsp;
        <Link 
            class={classes.styledLink}
            // variant="inherit"
            href='https://www.england.nhs.uk/ourwork/demand-and-capacity/models/demand-and-capacity-emergency-department-model/'> 
            here
        </Link>
        .
        </Typography>
        <br /> <br />
        <Grid container>
            <Grid item xs={8}>
                <Paper class={classes.redPaper} align="center">
                    <Typography variant="h5">
                        Warning!
                    </Typography>
                    <Typography>
                        Please do not upload any real data to this prototype. 
                        <br /> 
                        Sample datasets can be downloaded on the 'historic demand data' tab.
                    </Typography>
                </Paper>
            </Grid>
        </Grid>

        <br />
        <Grid container spacing={2}>
            <Grid item xs={4} align="center" >
                <Card class={classes.card} variant="outlined">
                    <Typography variant="h6">
                        Is it your first time here?
                    </Typography>
                    <Button variant="contained" href="/getting-started" >
                        Head to <br/> "Getting Started"
                    </Button>
                </Card>
            </Grid>
            <Grid item xs={4} align="center">
                <Card class={classes.card} variant="outlined">
                    <Typography variant="h6">
                        Returning visitor? Use the sidebar to navigate.
                    </Typography>
                </Card>
            </Grid>
      
        </Grid>

        <Typography variant="h6">
        <br /> 
        You can watch an introduction to the ideas behind the model below.
        <br /> 
        </Typography>
        
        <ReactPlayer
        url="https://www.youtube.com/watch?v=tK7Q7gXklVo"
      />
      <br /> <br />


        </div>
    )
}

