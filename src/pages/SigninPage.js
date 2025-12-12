import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const SigninPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/home');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/home');
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
                    <Form.Control
                        type="password"
                        placeholder="********"
                        className="py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 btn-primary-custom rounded-pill py-2 fw-bold mt-2">
                    Continue
                </Button>
            </Form>
        </AuthLayout>
    );
};

export default SigninPage;
