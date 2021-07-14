// Redux state store (wrapped in easy-peasy)

import { stringToArray } from 'ag-grid-community';
import { action, computed, thunk } from 'easy-peasy';
import { toast } from 'react-toastify';


// Notifications
const notifyLogout = () => toast.warn('Logged Out Successfully', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    });

function FetchEmail() {
    return fetch('users/current_user_email/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }})
        // Make sure to not wrap this first then statement in {}
        // otherwise it returns a promise instead of the json
        // and then you can't access the email attribute 
        .then(response => 
            response.json()
        )
        .then((json) => {
            return json["email"];
        });
}

function FetchHistoricBool() {
    return fetch('api/session-has-historic-data')
        // Make sure to not wrap this first then statement in {}
        // otherwise it returns a promise instead of the json
        // and then you can't access the email attribute 
        .then(response => 
            response.json()
        )
        .then((json) => {
            console.log(json)
            return json["result"];
        });
}


function FetchShiftTypes() {
    return fetch('api/'
    )
}

export default {
    
    // ---- States ---- //
    loggedIn: localStorage.getItem('access_token') ? true : false,
    
    userEmail: null,

    sessionHasHistoricData: null,

    shiftTypes: null,

    unsavedChangesFlag: false,

    // ---- Actions ---- //

    // Setting initial user email
    // See https://github.com/ctrlplusb/easy-peasy/issues/393
    setInitialStateEmail: action((state, payload) => {
        state.userEmail = payload;
      }),

    setStateEmailUserNotLoggedIn: action((state) => {
        state.userEmail = 'Anonymous User'
    }),

    fetchInitialStateEmail: thunk(async (actions) => {
        const data = await FetchEmail()
        actions.setInitialStateEmail(data);      
      }),


    // Check whether session has historic data
    setInitialStateSessionHasHistoric: action((state, payload) => {
        state.sessionHasHistoricData = payload;
      }),

    fetchInitialStateSessionHistoric: thunk(async (actions) => {
        const data = await FetchHistoricBool()
    actions.setInitialStateSessionHasHistoric(data);      
    }),

    // Logging in 
    loggedInTrue: action((state, payload) => {
        state.loggedIn = true;
        state.userEmail = payload["email"];
    }),

    // Logging Out
    logoutAction: action((state) => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        state.loggedIn = false;
        notifyLogout();
        // console.log(localStorage.getItem('access_token'))
    }),

    // Getting existing shift types



    // Unsaved changes
    setUnsavedChangesFlag: action((state) => {
        state.unsavedChangesFlag = true;
    }),

    clearUnsavedChangesFlag: action((state) => {
        state.unsavedChangesFlag = false;
    }),

};