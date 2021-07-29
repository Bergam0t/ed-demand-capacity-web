import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

export default function GettingStarted() {
    return (
        <div>
        <Typography variant="h3"> 
        Getting Started
        </Typography>
        <br /><br />

        <Typography variant="h5">
            1. Upload historical demand information
        </Typography>
        <Typography variant="h6"> 
            There are several options available for the format of the data - head to 'Historical demand data' to see them. 
        </Typography>
        <br /><br />
        
        <Typography variant="h5">
            2. Wait for attendances to be predicted
        </Typography>
        <Typography variant="h6"> 
            The app will then generate a predictive model and predict the attendances for the next eight weeks. Once this has finished, more options will become available in the menu on the left. 
        </Typography>
        <br /><br />
        
        <Typography variant="h5">
            3. Configure the setup of the department
        </Typography>
        <Typography variant="h6">
            This includes how long it takes to make a decision and the priority of streams, indicating which streams are seen first when resources are shared across streams.
        </Typography>
        <br /><br />
        
        <Typography variant="h5">
            4. Enter rota information for the department
        </Typography>
        <Typography variant="h6">
            This is so the app knows the people you have available and the shift patterns they are working, allowing it to calculate available decision-making time.
        </Typography>
        <br /><br />
        
        <Typography variant="h5">
            5. (OPTIONAL) Adjust for external factors 
        </Typography>
        <Typography variant="h6">
            You may wish to tell the app about additional factors that may affect demand or capacity (e.g. hot weather, closure of a nearby hospital).
        </Typography>
        <br /><br />
        
        <Typography variant="h5" >
            6. Get model outputs
        </Typography>
        <Typography variant="h6">
            Choose the week of the forecast that you are interested in and use the options in the menu bar under 'model outputs' to compare the available and required capacity balance for the department over the next week.
        </Typography>
        </div>
    )
}

6. 
