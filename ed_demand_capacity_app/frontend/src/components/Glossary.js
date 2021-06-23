import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
  });
  
  function createData(word, definition) {
    return { word, definition };
  }
  
  const rows = [
    createData('Stream', 
                `A grouping of patients that require a similar amount of time for 
                a clinical decision to be made for them.`),
    
    createData('Priority', 
               `Capacity resources can be allocated to multiple streams. 
                Prioritisation allows the user to specify where these resources should be prioritised 
                in case of competing demand.`),
    
    createData('Historic Demand', 
               `A minimum of one year of historic attendances to the department, 
               divided into streams.`),
    
    createData('Decisions Per Hour', 
                `The model forecasts the number of future attendances, and converts this 
                into required decision-making time, based on how long it typically takes`),
    
    createData('Required Capacity', 
                `The number of attendances per hour, multiplied by the clinical decision minutes required`),

    createData('Shift Configuration', 
               `The shift patterns thaat are used within the department - for example, 
               an early shift being 7am to 1pm.`),

    createData('Role Configuration', 
               `The types of clinical decision makers that staff the department, and the expected number of
               clinical decisions that they can make per hour for any given stream.`),

    createData('Rota Setup', 
               `Roles that have been created are matched to shifts that have been created to create the
               rota for the week.`),

    createData('Core/Ad-hoc Balance', 
               `A comparison between staff on the rota that are considered 'core' and those that are
               considered 'ad-hoc'`),
    
    createData('Events that affect demand for a service', 
                `Parameter options to manually increase or decrease attendances or time required to make 
                a decision. Useful if local intelligence indicates that something that wouldn't be identified
                using historic demand (e.g. hot weather) will affect the service requirement for the
                department.
                `),

    createData('Events that affect capacity for a service', 
                `Parameter options to manually increase or decrease the available capacity for the department
                that is not identified within the rota`),

    createData('Queue Size', 
               `Based on the difference between required and available capacity within the department
               throughout the week, a simulation of the length of the queue throughout the week can 
               be generated.`),
  ];

  export default function GlossaryTable() {
    const classes = useStyles();
  
    return (
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Term</TableCell>
              <TableCell>Definition</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.word}>
                <TableCell component="th" scope="row">
                  {row.word}
                </TableCell>
                <TableCell align="right">
                    {row.definition}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  