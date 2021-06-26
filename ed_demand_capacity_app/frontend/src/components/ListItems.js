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

// Routing imports
import { 
    Link, 
} from "react-router-dom";

export const helpListItems = (
    <div>
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
        <ListItem button>
      <ListItemIcon>
        <FolderOpenIcon />
      </ListItemIcon>
      <ListItemText primary="Load Model" />
    </ListItem>
    </div>
);

export const mainListItems = (
  <div>
    <ListItem button to="/notes" component = { Link }>
      <ListItemIcon>
        <NotesIcon />
      </ListItemIcon>
      <ListItemText primary="Notes" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Emergency Department Settings" />
    </ListItem>
    <ListItem button to="/historic-demand" component = { Link }>
      <ListItemIcon>
        <HistoryIcon />
      </ListItemIcon>
      <ListItemText primary="Historic Demand Data" />
    </ListItem>
    <ListItem button to="/shift-types" component = { Link }>
      <ListItemIcon>
        <ScheduleIcon />
      </ListItemIcon>
      <ListItemText primary="Shift Types" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <DateRangeIcon />
      </ListItemIcon>
      <ListItemText primary="Rotas" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <GroupIcon />
      </ListItemIcon>
      <ListItemText primary="Factors Affecting Demand" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <Battery60Icon />
      </ListItemIcon>
      <ListItemText primary="Factors Affecting Capacity" />
    </ListItem>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Model Outputs</ListSubheader>
    <ListItem button to="/historic-demand-graphs" component = { Link }>
      <ListItemIcon>
        <TimelineIcon />
      </ListItemIcon>
      <ListItemText primary="Historic Data Graphs" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <ThumbsUpDownIcon />
      </ListItemIcon>
      <ListItemText primary="Core-Adhoc Balance" />
    </ListItem>
    <ListItem button to="/required-vs-available-capacity" component = { Link }>
      <ListItemIcon>
        <EventNoteIcon />
      </ListItemIcon>
      <ListItemText primary="Required vs Available Capacity" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <TrendingUpIcon />
      </ListItemIcon>
      <ListItemText primary="Expected Queue Sizes" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <WarningIcon />
      </ListItemIcon>
      <ListItemText primary="Areas of Concern" />
    </ListItem>
  </div>
);