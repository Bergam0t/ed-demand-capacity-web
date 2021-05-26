import React, { Component } from "react";
import { render } from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
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

// export default function App(props) {
//     return (
        
//         <div>
//             <ThemeProvider theme={theme}>
//                 <Header />
//                 <AppSidebar />
//                 <Typography> Testing React UI </Typography>
//             </ThemeProvider>
//         </div>
//     );
// }

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
const [open, setOpen] = React.useState(true);
const handleDrawerOpen = () => {
    setOpen(true);
};
const handleDrawerClose = () => {
    setOpen(false);
};
const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

return (
    <Router>
    <Switch>
    <ThemeProvider theme={muiTheme}>
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
        <IconButton color="inherit">
            {/* <Badge badgeContent={4} color="secondary">
            <NotificationsIcon />
            </Badge> */}
            <Button color="inherit">Login</Button>
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
    </ThemeProvider>
    </Switch>
    </Router>
);
}

const appDiv = document.getElementById("app");
render(<App/>, appDiv);