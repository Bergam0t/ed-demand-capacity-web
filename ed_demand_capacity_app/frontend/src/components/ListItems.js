import React from 'react';

// List imports
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

// Icon imports
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import NotesIcon from '@material-ui/icons/Notes';
import SettingsIcon from '@material-ui/icons/Settings';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import HistoryIcon from '@material-ui/icons/History';
import ScheduleIcon from '@material-ui/icons/Schedule';
import GroupIcon from '@material-ui/icons/Group';
import Battery60Icon from '@material-ui/icons/Battery60';
import ThumbsUpDownIcon from '@material-ui/icons/ThumbsUpDown';
import EventNoteIcon from '@material-ui/icons/EventNote';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import WarningIcon from '@material-ui/icons/Warning';
import TimelineIcon from '@material-ui/icons/Timeline';
import DateRangeIcon from '@material-ui/icons/DateRange';
import MultilineChartIcon from '@material-ui/icons/MultilineChart';
import HelpIcon from '@material-ui/icons/Help';



// Routing imports
import { 
    Link, 
} from "react-router-dom";


export const helpListItems = (
    <div>
      <ListItem button to="/" component = { Link }>
        <ListItemIcon>
          <HelpIcon />
        </ListItemIcon>
        <ListItemText primary="About" />
      </ListItem>
      <ListItem button to="/getting-started" component = { Link }>
        <ListItemIcon>
          <EmojiObjectsIcon />
        </ListItemIcon>
        <ListItemText primary="Getting Started" />
      </ListItem>
    </div>
);

export const saveLoadItems = (
    <div>
        <ListItem button disabled>
      <ListItemIcon>
        <FolderOpenIcon />
      </ListItemIcon>
      <ListItemText primary="Load Model (COMING SOON)" />
    </ListItem>

    <ListItem button to="/notes" component = { Link }>
      <ListItemIcon>
        <NotesIcon />
      </ListItemIcon>
      <ListItemText primary="Notes" />
    </ListItem>
   
    </div>

);

export const setupItems = (
  <div>

    <ListSubheader inset>Demand Setup</ListSubheader>

    <ListItem button to="/historical-demand" component = { Link }>
      <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="Historical Demand Data" />
    </ListItem>

  </div>

)

export const capacityItems = (
  <div>

    <ListSubheader inset>Capacity Setup</ListSubheader>

    <ListItem button to="/ed-settings" component = { Link }>
    <ListItemIcon>
      <SettingsIcon />
    </ListItemIcon>
    <ListItemText primary="Emergency Department Settings" />
    </ListItem>

    <ListItem button to="/shift-types" component = { Link }>
      <ListItemIcon>
        <ScheduleIcon />
      </ListItemIcon>
      <ListItemText primary="Shift Types" />
    </ListItem>
    
    <ListItem button to="/rotas" component = { Link }>
      <ListItemIcon>
        <DateRangeIcon />
      </ListItemIcon>
      <ListItemText primary="Rotas" />
    </ListItem>

    </div>
);

export const adjustmentItems = (
  <div>

    <ListSubheader inset>Optional Adjustments</ListSubheader>

    <ListItem button to="/additional-factors-required-capacity" component = { Link }>
      <ListItemIcon>
        <GroupIcon />
      </ListItemIcon>
      <ListItemText primary="Required Capacity" />
    </ListItem>
    
    {/* <ListItem button to="/additional-factors-available-capacity" component = { Link }> */}
  <ListItem button disabled>
      <ListItemIcon>
        <Battery60Icon />
      </ListItemIcon>
      <ListItemText primary="Available Capacity (COMING SOON)" />
    </ListItem>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Model Outputs</ListSubheader>
    
    <ListItem button to="/historical-demand-graphs" component = { Link }>
      <ListItemIcon>
        <TimelineIcon />
      </ListItemIcon>
      <ListItemText primary="Historical Arrivals Graph" />
    </ListItem>

    <ListItem button to="/forecast-demand" component = { Link }>
      <ListItemIcon>
        <TrendingUpIcon />
      </ListItemIcon>
      <ListItemText primary="Forecast Demand per Stream" />
    </ListItem>
    
    <ListItem button disabled>
      <ListItemIcon>
        <ThumbsUpDownIcon />
      </ListItemIcon>
      <ListItemText primary="Core-Adhoc Balance" />
    </ListItem>
    
    <ListItem button to="/required-vs-available-capacity" component = { Link } disabled>
      <ListItemIcon>
        <MultilineChartIcon />
      </ListItemIcon>
      <ListItemText primary="Required vs Available Capacity" />
    </ListItem>
    
    {/* <ListItem button disabled>
      <ListItemIcon>
        <TrendingUpIcon />
      </ListItemIcon>
      <ListItemText primary="Expected Queue Sizes" />
    </ListItem> */}
    
    {/* <ListItem button>
      <ListItemIcon>
        <WarningIcon />
      </ListItemIcon>
      <ListItemText primary="Areas of Concern" />
    </ListItem> */}
  </div>
);