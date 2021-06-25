// Use this similar to HomePage in the sample app
// Routing code happens here? 
import React, { Component, useState, useEffect } from "react";
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
import { helpListItems, saveLoadItems, mainListItems, secondaryListItems } from './listItems';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Button from "@material-ui/core/Button";
import DashboardContent from "./DashboardContent";
import { makeStyles } from '@material-ui/core/styles';
import { useStoreState } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import DisplayUserWelcome from './DisplayUserWelcome';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import Glossary from './Glossary'
import Modal from '@material-ui/core/Modal';


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
      overflow:'scroll',
      display:'block'
    },

    
  }));

const drawerWidth = 280;



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

    // On loading, run the followwing

    useEffect(() => {
      fetchInitialStateEmail(); 
      fetchInitialStateSessionHistoric();
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
              <Button onClick={handleOpenGlossary}>
                <MenuBookIcon color="inherit" />  Glossary  
              </Button>
              <Modal
                open={openGlossary}
                onClose={handleCloseGlossary}
                className={classes.modal}
               >
                      <div>
                        <Grid container justify="space-between">
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
                          <Glossary />
                        </Grid>
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
        >
            <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
            </IconButton>
            </div>
            {userEmail && <DisplayUserWelcome />}
            <Divider />
            <List>{saveLoadItems}</List>
            <Divider />
            <List>{helpListItems}</List>
            <Divider />
            <List>{mainListItems}</List>
            <Divider />
            <List>{secondaryListItems}</List>
        </Drawer>
        
        <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="lg" className={classes.container}>
                <DashboardContent />
            </Container>
        </main>
        
        </div>
    );
        }