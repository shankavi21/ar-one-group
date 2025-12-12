import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card, ProgressBar } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaWhatsapp, FaArrowLeft } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';

const GuideDetailPage = () => {
    const { id } = useParams();
    const user = auth.currentUser;

    const guides = [
        { id: 1, name: 'Saman Perera', role: 'Cultural Expert', image: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 4.9, bio: 'Experienced guide with over 15 years showing travelers the ancient wonders of Sri Lanka. Fluent in English and Japanese.', location: 'Kandy', languages: ['English', 'Japanese', 'Sinhala'] },
        { id: 2, name: 'Nimali Silva', role: 'Wildlife Guide', image: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 4.8, bio: 'Passionate about Sri Lankan leopards and elephants. Has a degree in Zoology and 8 years in the field.', location: 'Yala', languages: ['English', 'German'] },
        // Fallback data for other IDs
    ];

    // Fallback/Simulated lookup
    const guide = guides.find(g => g.id === parseInt(id)) || {
        id: parseInt(id),
        name: 'Local Expert',
        role: 'Verified Guide',
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        rating: 4.8,
        bio: 'Passionate local guide ready to show you the best of Sri Lanka.',
        location: 'Colombo',
        languages: ['English', 'Sinhala']
    };

    return (
        <div className="min-vh-100 bg-light d-flex flex-column">
            <AppNavbar user={user} />
            <div className="bg-primary-custom py-5 pb-5 position-relative">
                <Container>
                    <Button as={Link} to="/guides" variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center bg-white text-primary-custom mb-3" style={{ width: '40px', height: '40px' }}>
                        <FaArrowLeft />
                    </Button>
                    <div style={{ height: '50px' }}></div>
                </Container>
            </div>

            <Container style={{ marginTop: '-100px' }}>
                <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                    <Card.Body className="p-0">
                        <Row className="g-0">
                            <Col md={4} className="bg-light d-flex align-items-center justify-content-center p-5">
                                <div className="text-center w-100">
                                    <div className="position-relative d-inline-block mb-3">
                                        <img
                                            src={guide.image}
                                            alt={guide.name}
                                            className="rounded-circle shadow-lg border border-4 border-white"
                                            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                        />
                                        <div className="position-absolute bottom-0 end-0 bg-success border border-4 border-white rounded-circle p-2" style={{ width: '30px', height: '30px' }}></div>
                                    </div>
                                    <h3 className="fw-bold mb-1">{guide.name}</h3>
                                    <p className="text-primary-custom fw-bold mb-2">{guide.role}</p>
                                    <div className="d-flex justify-content-center align-items-center mb-4">
                                        <FaStar className="text-warning" /> <span className="fw-bold fs-5 ms-1">{guide.rating}</span> <span className="text-secondary small ms-1">(150 Reviews)</span>
                                    </div>
                                    <div className="d-grid gap-2">
                                        <Button variant="success" className="rounded-pill fw-bold py-2"><FaWhatsapp className="me-2" /> Contact Me</Button>
                                    </div>
                                </div>
                            </Col>
                            <Col md={8} className="p-4 p-md-5">
                                <h4 className="fw-bold mb-4">About Me</h4>
                                <p className="text-secondary leading-relaxed mb-5">{guide.bio}</p>

                                <Row className="mb-5 g-4">
                                    <Col sm={6}>
                                        <div className="d-flex align-items-start">
                                            <div className="bg-light p-2 rounded-circle me-3 text-primary-custom">
                                                <FaMapMarkerAlt size={20} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0">Location</h6>
                                                <p className="text-secondary small mb-0">{guide.location}</p>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-start">
                                            <div className="bg-light p-2 rounded-circle me-3 text-primary-custom">
                                                <FaMapMarkerAlt size={20} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0">Experience</h6>
                                                <p className="text-secondary small mb-0">8+ Years</p>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={12}>
                                        <div className="d-flex align-items-start">
                                            <div className="bg-light p-2 rounded-circle me-3 text-primary-custom">
                                                <FaMapMarkerAlt size={20} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0">Languages</h6>
                                                <div className="d-flex gap-2 mt-1">
                                                    {guide.languages?.map((lang, idx) => (
                                                        <span key={idx} className="badge bg-light text-dark fw-normal border">{lang}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <h5 className="fw-bold mb-3">Rating Breakdown</h5>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-secondary">Communication</span>
                                        <span className="fw-bold">5.0</span>
                                    </div>
                                    <ProgressBar variant="info" now={100} style={{ height: '8px' }} className="rounded-pill" />
                                </div>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-secondary">Local Knowledge</span>
                                        <span className="fw-bold">4.8</span>
                                    </div>
                                    <ProgressBar variant="info" now={96} style={{ height: '8px' }} className="rounded-pill" />
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
            <Footer />
        </div>
    );
};

export default GuideDetailPage;
