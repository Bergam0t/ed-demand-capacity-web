import { action } from 'easy-peasy';

export default {
    // States
    loggedIn: localStorage.getItem('token') ? true : false,

    // Actions
    loggedInTrue: action((state) => {
        state.loggedIn = true;
    }),

};