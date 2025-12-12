import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';

const LandingPage = () => {
    return (
        <div className="bg-white min-vh-100 d-flex flex-column">
            <AppNavbar />
            <Container className="flex-grow-1 d-flex align-items-center">
                <Row className="w-100 align-items-center">
                    <Col md={6} className="mb-4 mb-md-0">
                        {/* Left side Image */}
                        <div className="rounded-4 overflow-hidden shadow-lg" style={{ height: '500px' }}>
                            <img
                                src="/beach.png"
                                alt="Sri Lanka Tourism"
                                className="object-cover"
                            />
                        </div>
                    </Col>
                    <Col md={6} className="ps-md-5">
                        <h1 className="display-3 fw-bold mb-4 text-dark">Discover the Wonder of Sri Lanka</h1>
                        <p className="lead text-secondary mb-5">
                            Experience the breathtaking beauty, rich culture, and serene landscapes of the pearl of the Indian Ocean. Your journey begins here.
                        </p>
                        <Button as={Link} to="/register" size="lg" className="btn-primary-custom px-5 py-3 rounded-pill shadow">
                            Get Started
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LandingPage;
