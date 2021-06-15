import React from 'react';
import { useStoreState } from 'easy-peasy';
import Typography from "@material-ui/core/Typography";

export default function DisplayUserWelcome() {
    const loggedIn = useStoreState((state) => state.loggedIn);
    const userEmail = useStoreState((state) => state.userEmail);

    if (loggedIn) {
        return (
            <Typography variant="body1"> 
            Welcome {userEmail}!
            </Typography>
        )
    } else {
        return (
            <Typography variant="body1"> 
            Welcome anonymous user!
            </Typography>
        )
    }
}