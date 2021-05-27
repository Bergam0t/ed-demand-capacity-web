import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { render } from 'react-dom';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

// export default function HistoricDemandData() {
//     return (
//         <Typography variant="h3"> 
//         Historic Demand Data (Placeholder)
//         </Typography>
//     )
// }

// Display a table

// export default function HistoricDemandData() {
//     const rowData = [
//         {make: "Toyota", model: "Celica", price: 35000},
//         {make: "Ford", model: "Mondeo", price: 32000},
//         {make: "Porsche", model: "Boxter", price: 72000}
//     ];
 
//     return (
//         <div className="ag-theme-material" style={{height: 400, width: 600}}>
//             <AgGridReact
//                 rowData={rowData}>
//                 <AgGridColumn field="make"></AgGridColumn>
//                 <AgGridColumn field="model"></AgGridColumn>
//                 <AgGridColumn field="price"></AgGridColumn>
//             </AgGridReact>
//         </div>
//     );
//  };
 
