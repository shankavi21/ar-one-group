import React from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, isLogin, onGoogleSignIn }) => {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
            background: 'linear-gradient(135deg, #0891b2 0%, #055a6f 100%)'
        }}>
            <Card className="border-0 shadow-lg overflow-hidden" style={{ maxWidth: '1000px', width: '90%', borderRadius: '20px' }}>
                <Row className="g-0">
                    <Col md={6} className="d-none d-md-block position-relative">
                        <img
                            src="/ella.png"
                            alt="Travel"
                            className="object-cover h-100"
                            style={{ minHeight: '600px' }}
                        />
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white text-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                            <h2 className="display-4 fw-bold mb-3">AR One Tourism</h2>
                            <p className="fs-5 mb-2">Your Gateway to Sri Lanka's Wonders</p>
                            <p className="fs-6 px-4 mb-0" style={{ maxWidth: '400px' }}>
                                Discover ancient temples, pristine beaches, and lush tea plantations. Experience authentic Sri Lankan culture with expert local guides.
                            </p>
                        </div>
                    </Col>
                    <Col md={6} className="p-5 bg-white d-flex align-items-center">
                        <div className="w-100">
                            <div className="d-flex justify-content-end mb-4">
                                <Link to="/" className="text-decoration-none text-secondary">Back to Home</Link>
                            </div>
                            <h3 className="fw-bold mb-4 text-dark">{title}</h3>
                            {children}
                            <div className="mt-4 text-center">
                                <p className="text-secondary">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <Link to={isLogin ? "/register" : "/login"} className="text-primary-custom fw-bold text-decoration-none">
                                        {isLogin ? "Sign up" : "Log in"}
                                    </Link>
                                </p>
                                <div className="d-flex align-items-center my-3">
                                    <hr className="flex-grow-1" />
                                    <span className="mx-3 text-secondary small">or</span>
                                    <hr className="flex-grow-1" />
                                </div>
                                <Button
                                    variant="outline-dark"
                                    className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
                                    onClick={onGoogleSignIn}
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
                                    Sign {isLogin ? 'in' : 'up'} with Google
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default AuthLayout;
