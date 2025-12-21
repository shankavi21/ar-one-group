import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getGuideByUid } from '../services/firestoreService';

const GuideProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGuide, setIsGuide] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Check if user exists in guides collection
                try {
                    const guideData = await getGuideByUid(currentUser.uid);
                    if (guideData) {
                        setIsGuide(true);
                        localStorage.setItem('guideId', guideData.id);
                        localStorage.setItem('guideName', guideData.name);
                    } else {
                        setIsGuide(false);
                    }
                } catch (error) {
                    console.error("Error checking guide status:", error);
                    setIsGuide(false);
                }
            } else {
                setUser(null);
                setIsGuide(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user || !isGuide) {
        return <Navigate to="/guide/login" replace />;
    }

    return children;
};

export default GuideProtectedRoute;
