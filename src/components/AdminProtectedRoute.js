import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { isAdminUser } from '../utils/adminConfig';

const AdminProtectedRoute = ({ children }) => {
    const user = auth.currentUser;

    // If not logged in, redirect to login
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    // If logged in but not admin, redirect to home
    if (!isAdminUser(user.email)) {
        return <Navigate to="/home" replace />;
    }

    // If admin, render the admin panel
    return children;
};

export default AdminProtectedRoute;
