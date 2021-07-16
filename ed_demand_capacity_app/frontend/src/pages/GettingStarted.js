import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

export default function GettingStarted() {
    return (
        <div>
        <Typography variant="h3"> 
        Getting Started
        </Typography>
       
        <Typography variant="h6">
        1. Upload historic demand information in to the model. Up to three years of data can be entered in to the model. 
        <br /><br />
        2. The model will then predict the attendances for the next week. 
        <br /><br />
        3. Configure the setup of the department, including how long it takes to make a decision and the priority in which streams are seen.
        <br /><br />
        4. Enter rota information for the department, such as the efficacy of resources and the shift patterns they are working.
        <br /><br />
        5. Use the parameters to account for 'external factors' that the forecasting app would not be able to account for.
        <br /><br />
        6. Use the options in the menu bar under 'model outputs' to compare the available and required capacity balance for the department over the next week.

        </Typography>
        </div>
    )
}

6. 
