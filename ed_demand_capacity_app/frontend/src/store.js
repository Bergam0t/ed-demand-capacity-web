import { action } from 'easy-peasy';

export default {
    // States
    loggedIn: localStorage.getItem('token') ? true : false,

    // Actions
    loggedInTrue: action((state) => {
        state.loggedIn = true;
    }),

    logoutAction: action((state) => {
        localStorage.removeItem('token');
        state.loggedIn = false;
    })

};