import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const SettingsPage = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;

    useEffect(() => {
        // Redirect to profile page with settings tab active
        if (user) {
            navigate('/profile?tab=settings');
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    return null;
};

export default SettingsPage;
