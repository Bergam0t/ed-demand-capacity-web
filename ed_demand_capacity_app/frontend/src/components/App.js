import React, { Component } from "react";
import { render } from "react-dom";
import Header from "./Header";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import Typography from '@material-ui/core/typography';

const font =  "'Istok Web', sans-serif;";

const theme = createMuiTheme({
    palette: {
       primary: {
          main: "#005EB8" // NHS Blue
                 },
       secondary: {
          main: "#ED8B00" // NHS Orange
                  }
             },
 fontFamily: font // Istok is very close to Frutiger, the NHS font
 });

// export default class App extends Component {
//     constructor(props) {
//         super(props);
//     }

//     render() {
//         return <h1> Testing React Code</h1>;
//     }
// }

    
// const appDiv = document.getElementById("app");
// render(<App />, appDiv);

export default function App(props) {
    return (
        
        <div>
            <ThemeProvider theme={theme}>
                <Header />
                <Typography> Testing React UI </Typography>
            </ThemeProvider>
        </div>
    );
}

const appDiv = document.getElementById("app");
render(<App/>, appDiv);