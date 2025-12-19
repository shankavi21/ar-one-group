import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { auth, googleProvider, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const SignupPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            // Save user data to Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: 'user',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });

            // Set localStorage for immediate UI update (AppNavbar uses this) - Scoped to UID
            localStorage.setItem(`userDisplayName_${user.uid}`, name);
            window.dispatchEvent(new Event('local-storage-update'));

            navigate('/home');
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists first to avoid overwriting existing data (like role)
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    role: 'user',
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp()
                });
                // Set initial local storage for new Google user - Scoped to UID
                localStorage.setItem(`userDisplayName_${user.uid}`, user.displayName);
                localStorage.setItem(`userPhotoURL_${user.uid}`, user.photoURL);
            } else {
                await setDoc(userDocRef, {
                    lastLogin: serverTimestamp()
                }, { merge: true });

                // Fetch latest user data to update localStorage - Scoped to UID
                const userData = userDoc.data();
                if (userData.name) localStorage.setItem(`userDisplayName_${user.uid}`, userData.name);
                if (userData.photoURL) localStorage.setItem(`userPhotoURL_${user.uid}`, userData.photoURL);
                if (userData.phone) localStorage.setItem(`userPhone_${user.uid}`, userData.phone);
                if (userData.bio) localStorage.setItem(`userBio_${user.uid}`, userData.bio);

                window.dispatchEvent(new Event('local-storage-update'));
            }

            navigate('/home');
        } catch (err) {
            console.error("Google Sign In error:", err);
            setError(err.message);
        }
    };

    return (
        <AuthLayout title="Create Account" isLogin={false} onGoogleSignIn={handleGoogleSignIn}>
            {error && <div className="alert alert-danger p-2 small">{error}</div>}
            <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label className="small fw-bold text-secondary">Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Your Name"
                        className="py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>

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
                    <Form.Control
                        type="password"
                        placeholder="********"
                        className="py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <Form.Text className="text-muted small">
                        Password must be at least 6 characters.
                    </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 btn-primary-custom rounded-pill py-2 fw-bold mt-2">
                    Continue
                </Button>
            </Form>
        </AuthLayout>
    );
};

export default SignupPage;
