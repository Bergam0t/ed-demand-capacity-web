// Use this similar to HomePage in the sample app
// Routing code happens here? 
import React, { Component, useState, useEffect, useRef } from "react";
import { 
    BrowserRouter as Router, 
    Switch, 
    Route, 
    Link, 
    Redirect 
} from "react-router-dom";
import CancelIcon from '@material-ui/icons/Cancel';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import clsx from 'clsx';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from "@material-ui/icons/Menu";
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import { helpListItems, saveLoadItems, capacityItems, adjustmentItems, secondaryListItems, setupItems } from './ListItems';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Button from "@material-ui/core/Button";
import DashboardContent from "./DashboardContent";
import { makeStyles } from '@material-ui/core/styles';
import { useStoreState, useStoreActions } from 'easy-peasy';
import DisplayUserWelcome from './DisplayUserWelcome';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import Glossary from './Glossary'
import Modal from '@material-ui/core/Modal';
import { v4 as uuidv4 } from 'uuid';


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
      overflowY: 'auto',
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
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
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
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // position: 'fixed',
      width: '60%',
      height: '50%',
      top: '50%',
      left: '50%',
      transform: 'translate(40%, 50%)',
      // overflow:'scroll',
      display:'block'
    },

    menuBookIcon: {
      color: '#ffffff'
    },

    muiButtonLabelWhite: {
      color: '#ffffff'
    },

    
  }));

const drawerWidth = 330;



// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
// https://blog.bitsrc.io/polling-in-react-using-the-useinterval-custom-hook-e2bcefda4197
export function useInterval(callback, delay) {
  const savedCallback = useRef();
  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);

}


function fetchDataProcessedBool() {
  return fetch('api/session-data-processed')
      // Make sure to not wrap this first then statement in {}
      // otherwise it returns a promise instead of the json
      // and then you can't access the email attribute 
      .then(response => 
          response.json()
      )
      .then((json) => {
          return json["result"];
      });
}

export default function ContentHolder() {

    // Control of styling
    const classes = useStyles();

    // --- Menu state control --- //

    const [open, setOpen] = React.useState(true);
    
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };
    // const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    // --- Glossary state control --- //

    const [openGlossary, setOpenGlossary] = React.useState(false);

    const handleOpenGlossary = () => {
      setOpenGlossary(true);
      
    };

    const handleCloseGlossary = () => {
      setOpenGlossary(false);
    };

    // --- Login and logout --- //

    const loggedIn = useStoreState(state => state.loggedIn)

    const toggleLogOut = useStoreActions((actions) => actions.logoutAction);

    const LoginLogoutButton = ({}) => {
      if (loggedIn) {
        return <Button color="inherit" onClick={toggleLogOut}>Logout</Button>;
      } 
      return <Button color="inherit" to="/login" component = { Link }>Login</Button>;
    };
    
    const userEmail = useStoreState(state => state.userEmail)
    const fetchInitialStateEmail = useStoreActions(actions => actions.fetchInitialStateEmail);
    
    
    const fetchInitialStateSessionHistoric = useStoreActions(actions => actions.fetchInitialStateSessionHistoric);

    // Check for processed data
    const sessionDataProcessed = useStoreState(state => state.sessionDataProcessed)
    const toggleDataProcessed = useStoreActions((actions) => actions.setSessionDataProcessed);
    const fetchInitialStateDataProcessed = useStoreActions((actions) => actions.fetchInitialStateSessionDataProcessed)

    const [previousCheckResult, setPreviousCheckResult] = React.useState(false)
    const [menuUUID, setMenuUUID] = React.useState(uuidv4())

    // If session data hasn't yet been processed, check every 15 seconds
    // whether the processing is complete
    var count = 0
    
    useInterval(async () => {
      var processed = true
      if (count == 0){
        setPreviousCheckResult(sessionDataProcessed)
      }

      if (!sessionDataProcessed) {
        processed = await fetchDataProcessedBool();
        count++
        console.log("Data processed: ", processed)
        }
        if (count != 0) {
          setPreviousCheckResult(processed)
        }
      if (sessionDataProcessed != previousCheckResult) {
        setMenuUUID(uuidv4())
      }
      
      // Have to still do this step to avoid invalidating rules of hooks
      toggleDataProcessed(processed)

    }, 15000)
    


    // Only render some menu components if data has been processed
    function renderDependentMenuItems() {
      if (sessionDataProcessed) {
        return (
          <div key={menuUUID}>
            <List>{capacityItems}</List>
            <Divider />
            <List>{adjustmentItems}</List>
            <Divider />
            <List>{secondaryListItems}</List>
          </div>
            )
      }
    }

  // Check for period of interest
  const fetchInitialPeriodOfInterest = useStoreActions((actions) => actions.fetchInitialPeriodOfInterest);


    // On loading, run the followwing

    useEffect(() => {
      fetchInitialStateEmail(); 
      fetchInitialStateSessionHistoric();
      fetchInitialStateDataProcessed();
      fetchInitialPeriodOfInterest();
  }, [])
    

    
    // App logic

    return (
        <div className={classes.root}>
        
        <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
            <Toolbar className={classes.toolbar}>
              
              <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
              >
                  <MenuIcon />
              </IconButton>
              
              <Typography component="h1" variant="h5" color="inherit" noWrap className={classes.title}>
                  NHS Demand and Capacity - Emergency Department Model
              </Typography>
              
              <Button onClick={handleOpenGlossary} 
              className={classes.muiButtonLabelWhite}>
                <MenuBookIcon className={classes.menuBookIcon}/>  Glossary  
              </Button>
              
              <Modal
                open={openGlossary}
                onClose={handleCloseGlossary}
                className={classes.modal}
               >
                      <div>
                        <Box style={{backgroundColor: "white"}}>
                        <Grid container justify="space-between" style={{paddingTop: 10, paddingLeft: 10, paddingRight: 10, paddingBottom:10}}>
                          <Grid item>
                            <Typography variant="h4"> 
                              Glossary 
                            </Typography>
                          </Grid>
                          <Grid item>
                            <IconButton onClick={handleCloseGlossary} >
                              <CancelIcon />
                            </IconButton>
                          </Grid>
                          </Grid>
                          <Card bordered="false" style={{overflow: 'auto', height: '50vh'}}>
                            <Glossary />
                          </Card>
                          </Box>
                        
                  </ div>
              </Modal>
              
              <IconButton color="inherit">
                  <LoginLogoutButton />
              </IconButton>

            </Toolbar>
        </AppBar>
        
        <Drawer
            variant="permanent"
            classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
            }}
            open={open}
            style={{ overflowY: 'scroll', height: '100vh' , overflow: "hidden", overflowX: "hidden"}}
        >
            <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
            </IconButton>
            </div>

            {userEmail && <DisplayUserWelcome />}
            <Divider />
            <List>{helpListItems}</List>
            <Divider />
            <List>{saveLoadItems}</List>
            <Divider />
            <List>{setupItems}</List>
            <Divider />

            {/* <List>{capacityItems}</List>
            <Divider />
            
            <List>{adjustmentItems}</List>
             <Divider />
            
            <List>{secondaryListItems}</List>
            
            <List> " " </List>
            <List> " " </List>
            <List> " " </List>
            <List> " " </List> */}

            {renderDependentMenuItems()}
            
        </Drawer>
        
        
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth={false} className={classes.container}>
                <DashboardContent />
            </Container>
        </main>
        
        </div>
    );
        }