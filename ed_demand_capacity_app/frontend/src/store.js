import { action } from 'easy-peasy';

export default {
    // States
    loggedIn: false,

    // Actions
    loggedInTrue: action((state) => {
        state.loggedIn = true;
    }),

};