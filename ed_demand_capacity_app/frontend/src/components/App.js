import React, { Component } from "react";
import { render } from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

import ContentHolder from "./ContentHolder"

import { 
  BrowserRouter as Router, 
  Switch, 
  Route, 
  Link, 
  Redirect 
} from "react-router-dom";

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

const drawerWidth = 280;

// Styling from https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/dashboard/Dashboard.js

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    toolbar: {
      paddingRight: 4, // keep right padding when drawer closed
    },
    toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 12,
    },
    menuButtonHidden: {
      display: 'none',
    },
    title: {
      flexGrow: 1,
    },
    drawerPaper: {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      height: '100vh',
      overflow: 'auto',
    },
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: 240,
    },
  }));

export default function App() {
  const classes = useStyles();


  return (
      <Router>
        <Switch>
          <ThemeProvider theme={muiTheme}>
            <ContentHolder />
          </ThemeProvider>
        </Switch>
      </Router>
  );
  }

const appDiv = document.getElementById("app");
render(<App/>, appDiv);