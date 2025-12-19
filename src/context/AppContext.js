import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// Currency conversion rates (base: LKR)
const CURRENCY_RATES = {
    LKR: 1,
    USD: 0.0031,
    EUR: 0.0029,
    GBP: 0.0025,
    INR: 0.26
};

const CURRENCY_SYMBOLS = {
    LKR: 'LKR',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹'
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'LKR');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [notifications, setNotifications] = useState({
        emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') || 'true'),
        smsNotifications: JSON.parse(localStorage.getItem('smsNotifications') || 'false'),
        newsletterSubscription: JSON.parse(localStorage.getItem('newsletterSubscription') || 'true'),
        bookingReminders: JSON.parse(localStorage.getItem('bookingReminders') || 'true')
    });

    const refreshUserProfile = async (currentUser = auth.currentUser) => {
        if (currentUser) {
            try {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserProfile(userData);

                    // Sync to localStorage for UI components (Scoped to UID)
                    if (userData.name) localStorage.setItem(`userDisplayName_${currentUser.uid}`, userData.name);
                    if (userData.photoURL) localStorage.setItem(`userPhotoURL_${currentUser.uid}`, userData.photoURL);
                    if (userData.phone) localStorage.setItem(`userPhone_${currentUser.uid}`, userData.phone);
                    if (userData.bio) localStorage.setItem(`userBio_${currentUser.uid}`, userData.bio);

                    // Trigger update across the app
                    window.dispatchEvent(new Event('local-storage-update'));
                    return userData;
                }
            } catch (error) {
                console.error("Error refreshing user profile:", error);
            }
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                await refreshUserProfile(currentUser);
            } else {
                setUserProfile(null);
            }
            setUser(currentUser);
            setLoadingUser(false);
        });
        return () => unsubscribe();
    }, []);

    // Save to localStorage when changed
    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('emailNotifications', notifications.emailNotifications);
        localStorage.setItem('smsNotifications', notifications.smsNotifications);
        localStorage.setItem('newsletterSubscription', notifications.newsletterSubscription);
        localStorage.setItem('bookingReminders', notifications.bookingReminders);
    }, [notifications]);

    // Convert price from LKR to selected currency
    const convertPrice = (priceInLKR) => {
        const numericPrice = typeof priceInLKR === 'string'
            ? parseInt(priceInLKR.replace(/[^0-9]/g, ''))
            : priceInLKR;

        const converted = numericPrice * CURRENCY_RATES[currency];
        return Math.round(converted);
    };

    // Format price with currency symbol
    const formatPrice = (priceInLKR) => {
        const converted = convertPrice(priceInLKR);
        const symbol = CURRENCY_SYMBOLS[currency];

        if (currency === 'LKR' || currency === 'INR') {
            return `${symbol} ${converted.toLocaleString()}`;
        } else {
            return `${symbol}${converted.toLocaleString()}`;
        }
    };

    const updateCurrency = (newCurrency) => {
        setCurrency(newCurrency);
    };

    const updateLanguage = (newLanguage) => {
        setLanguage(newLanguage);
    };

    const updateNotifications = (newNotifications) => {
        setNotifications(prev => ({ ...prev, ...newNotifications }));
    };

    const value = {
        user,
        userProfile,
        loadingUser,
        currency,
        language,
        notifications,
        updateCurrency,
        updateLanguage,
        updateNotifications,
        refreshUserProfile,
        convertPrice,
        formatPrice,
        CURRENCY_SYMBOLS
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};
