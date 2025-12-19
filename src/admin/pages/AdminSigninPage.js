import React, { useState } from 'react';
import { Form, Button, Card, Container, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { isAdminUser } from '../../utils/adminConfig';
import { FaEye, FaEyeSlash, FaUserShield, FaEnvelope, FaLock } from 'react-icons/fa';

const AdminSigninPage = () => {
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

        // Strict Admin Email Check
        if (!isAdminUser(email)) {
            setTimeout(() => { // Fake delay for security
                setError('Access Denied: This portal is for administrators only.');
                setLoading(false);
            }, 1000);
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (isAdminUser(user.email)) {
                navigate('/admin');
            } else {
                await auth.signOut();
                setError('Access Denied: Not an admin account.');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f0f2f5' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <div className="text-center mb-4">
                            <div
                                className="rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-3"
                                style={{ width: '80px', height: '80px', backgroundColor: '#0891b2', color: 'white' }}
                            >
                                <FaUserShield size={40} />
                            </div>
                            <h2 className="fw-bold text-dark">Admin Portal</h2>
                            <p className="text-muted">Secure access for system administrators</p>
                        </div>

                        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="h-1 bg-primary" style={{ backgroundColor: '#0891b2', height: '6px' }}></div>
                            <Card.Body className="p-5">
                                {error && (
                                    <div className="alert alert-danger d-flex align-items-center mb-4 border-0 bg-danger bg-opacity-10 text-danger rounded-3 p-3">
                                        <FaLock className="me-2" />
                                        <small className="fw-semibold">{error}</small>
                                    </div>
                                )}

                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-secondary text-uppercase tracking-wide">Email Address</Form.Label>
                                        <InputGroup className="input-group-lg">
                                            <InputGroup.Text className="bg-light border-end-0 text-muted">
                                                <FaEnvelope size={18} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="email"
                                                placeholder="admin@arone.lk"
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
                                        variant="primary"
                                        type="submit"
                                        className="w-100 rounded-pill py-3 fw-bold mt-2 shadow-sm"
                                        style={{ backgroundColor: '#0891b2', borderColor: '#0891b2', letterSpacing: '0.5px' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                                    </Button>
                                </Form>
                            </Card.Body>
                            <Card.Footer className="bg-white border-0 text-center py-3">
                                <a href="/" className="text-decoration-none text-secondary small hover-primary">
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

export default AdminSigninPage;
