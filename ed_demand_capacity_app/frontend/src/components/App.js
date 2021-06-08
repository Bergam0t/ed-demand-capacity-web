import React, { Component, useState } from "react";
import { render } from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ContentHolder from "./ContentHolder"

import { 
  BrowserRouter as Router, 
  Switch, 
  Route, 
  Link, 
  Redirect 
} from "react-router-dom";

import { StoreProvider, createStore, persist } from 'easy-peasy';

import storeFile from '../store'

const font =  "'Istok Web', sans-serif;";

const muiTheme = createMuiTheme({
    palette: {
       primary: {
          main: "#005EB8" // NHS Blue
                 },
       secondary: {
          main: "#ED8B00" // NHS Orange
                  }
             },
             typography: {
                h5: {
                    fontWeight: 600,
                  },
 fontFamily: font // Istok is very close to Frutiger, the NHS font
 }});

// Create the easy-peasy wrapped Redux store 
// const store = createStore(persist(storeFile));
const store = createStore(storeFile);


export default function App() {

  return (
    <StoreProvider store={store}>
        <Router>
          <Switch>
            <ThemeProvider theme={muiTheme}>
            <ToastContainer />
                <ContentHolder />
                
            </ThemeProvider>
          </Switch>
        </Router>
    </StoreProvider>
  );
};

const appDiv = document.getElementById("app");
render(<App/>, appDiv);




// class App extends Component {

//   render () {
//     return (
//       <Router>
//         <Switch>
//           <ThemeProvider theme={muiTheme}>
//             <ContentHolder />
//           </ThemeProvider>
//         </Switch>
//       </Router>
//   );
//   }

// }