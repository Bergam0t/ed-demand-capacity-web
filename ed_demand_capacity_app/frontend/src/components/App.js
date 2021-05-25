import React, { Component } from "react";
import { render } from "react-dom";
import Header from "./Header";

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
        <Header />
        <h1> Testing React Code</h1>
        </div>
    );
}

const appDiv = document.getElementById("app");
render(<App/>, appDiv);