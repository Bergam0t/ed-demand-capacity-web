import { action } from 'easy-peasy';
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


export default {
    
    // ---- States ---- //
    loggedIn: localStorage.getItem('token') ? true : false,

    // ---- Actions ---- //

    // Logging in 
    loggedInTrue: action((state) => {
        state.loggedIn = true;
    }),


    // Logging Out



    logoutAction: action((state) => {
        localStorage.removeItem('token');
        state.loggedIn = false;
        notifyLogout();
    })

};