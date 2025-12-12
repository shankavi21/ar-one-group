// Admin configuration
// This file contains the fixed admin credentials

export const ADMIN_CONFIG = {
    email: 'admin@arone.lk',
    // Note: In production, never hardcode passwords in frontend code
    // This password should be set in Firebase Auth dashboard
    // For now, we'll check by email only
};

// Check if a user is an admin based on their email
export const isAdminUser = (email) => {
    return email === ADMIN_CONFIG.email;
};

// Check if current authenticated user is admin
export const isCurrentUserAdmin = (user) => {
    if (!user) return false;
    return isAdminUser(user.email);
};
