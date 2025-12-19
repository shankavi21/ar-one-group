import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { auth, googleProvider, db } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { isAdminUser } from '../utils/adminConfig';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SigninPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update last login
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                lastLogin: serverTimestamp()
            }, { merge: true });

            // Fetch latest user data to update localStorage
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.name) localStorage.setItem(`userDisplayName_${user.uid}`, userData.name);
                if (userData.photoURL) localStorage.setItem(`userPhotoURL_${user.uid}`, userData.photoURL);
                if (userData.phone) localStorage.setItem(`userPhone_${user.uid}`, userData.phone);
                if (userData.bio) localStorage.setItem(`userBio_${user.uid}`, userData.bio);

                // Dispatch event so other components (like AppNavbar) update immediately
                window.dispatchEvent(new Event('local-storage-update'));
            }

            // If user is admin trying to log in via user portal, we can either allow it and send to home, 
            // or block it. User request implies separation.
            // Let's just send everyone to home from here. Admin portal is separate.
            navigate('/home');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists first to avoid overwriting existing data
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    role: isAdminUser(user.email) ? 'admin' : 'user',
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp()
                });
                // Set initial local storage for new Google user
                localStorage.setItem(`userDisplayName_${user.uid}`, user.displayName);
                localStorage.setItem(`userPhotoURL_${user.uid}`, user.photoURL);
            } else {
                await setDoc(userDocRef, {
                    lastLogin: serverTimestamp()
                }, { merge: true });

                // Update local storage for existing Google user
                const userData = userDoc.data();
                if (userData.name) localStorage.setItem(`userDisplayName_${user.uid}`, userData.name);
                if (userData.photoURL) localStorage.setItem(`userPhotoURL_${user.uid}`, userData.photoURL);
                if (userData.phone) localStorage.setItem(`userPhone_${user.uid}`, userData.phone);
                if (userData.bio) localStorage.setItem(`userBio_${user.uid}`, userData.bio);
            }

            // Check if user is admin and redirect accordingly
            if (isAdminUser(user.email)) {
                // Even if admin logs in via Google here, we'll send to home.
                // Or we could redirect to admin if they are really admin. 
                // But request says "Users and admins should not share the same login page".
                // So if an admin uses this page, treat them as a user.
                navigate('/home');
            } else {
                navigate('/home');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AuthLayout title="Welcome Back" isLogin={true} onGoogleSignIn={handleGoogleSignIn}>
            {error && <div className="alert alert-danger p-2 small">{error}</div>}
            <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="small fw-bold text-secondary">Email Address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        className="py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label className="small fw-bold text-secondary">Password</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            className="py-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                            className="d-flex align-items-center bg-white border-start-0 border-top-0 border-end-0 border-bottom"
                            style={{ borderColor: '#ced4da' }}
                        >
                            {showPassword ? <FaEyeSlash className="text-secondary" /> : <FaEye className="text-secondary" />}
                        </Button>
                    </InputGroup>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 btn-primary-custom rounded-pill py-2 fw-bold mt-2">
                    Continue
                </Button>
            </Form>
        </AuthLayout>
    );
};

export default SigninPage;
