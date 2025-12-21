import React, { useState } from 'react';
import { Form, Button, Card, Container, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getGuideByUid } from '../../services/firestoreService';
import { FaEye, FaEyeSlash, FaUserTie, FaEnvelope, FaLock } from 'react-icons/fa';

const GuideSigninPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if user is a guide
            const guideData = await getGuideByUid(user.uid);
            if (guideData) {
                localStorage.setItem('guideId', guideData.id);
                localStorage.setItem('guideName', guideData.name);
                navigate('/guide');
            } else {
                await auth.signOut();
                setError('Access Denied: You are not registered as a guide.');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8f9fa' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <div className="text-center mb-4">
                            <div
                                className="rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-3"
                                style={{ width: '80px', height: '80px', backgroundColor: '#eab308', color: 'white' }}
                            >
                                <FaUserTie size={40} />
                            </div>
                            <h2 className="fw-bold text-dark">Guide Portal</h2>
                            <p className="text-muted">Welcome back! Please sign in to manage your tours.</p>
                        </div>

                        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="h-1 bg-warning" style={{ height: '6px' }}></div>
                            <Card.Body className="p-5">
                                {error && (
                                    <div className="alert alert-danger d-flex align-items-center mb-4 border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3">
                                        <FaLock className="me-2" />
                                        <small className="fw-semibold">{error}</small>
                                    </div>
                                )}

                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-secondary text-uppercase tracking-wide">Guide Email</Form.Label>
                                        <InputGroup className="input-group-lg">
                                            <InputGroup.Text className="bg-light border-end-0 text-muted">
                                                <FaEnvelope size={18} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="email"
                                                placeholder="yourname@example.com"
                                                className="border-start-0 bg-light fs-6"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                style={{ boxShadow: 'none' }}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-secondary text-uppercase tracking-wide">Password</Form.Label>
                                        <InputGroup className="input-group-lg">
                                            <InputGroup.Text className="bg-light border-end-0 text-muted">
                                                <FaLock size={18} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="border-start-0 border-end-0 bg-light fs-6"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                style={{ boxShadow: 'none' }}
                                            />
                                            <Button
                                                variant="light"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="border border-start-0 bg-light text-muted"
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>

                                    <Button
                                        variant="warning"
                                        type="submit"
                                        className="w-100 rounded-pill py-3 fw-bold mt-2 shadow-sm text-white"
                                        style={{ backgroundColor: '#eab308', borderColor: '#eab308', letterSpacing: '0.5px' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Authenticating...' : 'Sign In as Guide'}
                                    </Button>
                                </Form>
                            </Card.Body>
                            <Card.Footer className="bg-white border-0 text-center py-3">
                                <a href="/" className="text-decoration-none text-secondary small">
                                    ← Return to Main Website
                                </a>
                            </Card.Footer>
                        </Card>

                        <div className="text-center mt-4 text-muted small">
                            &copy; {new Date().getFullYear()} AR One Tourism. All rights reserved.
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default GuideSigninPage;
