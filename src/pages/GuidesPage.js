import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaStar, FaArrowLeft } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';

import { getAllGuides } from '../services/firestoreService';

const GuidesPage = () => {
    const user = auth.currentUser;
    const [searchTerm, setSearchTerm] = useState('');
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const data = await getAllGuides();
                // Filter only approved guides for public view if status exists
                const approved = data.filter(g => !g.status || g.status === 'approved');
                setGuides(approved);
            } catch (error) {
                console.error("Error loading guides", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGuides();
    }, []);

    const filteredGuides = guides.filter(guide =>
        guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-vh-100 bg-light d-flex flex-column">
            <AppNavbar user={user} />
            <Container className="py-5 mt-5">
                <div className="mb-5 text-center">
                    <h1 className="fw-bold mb-3">Meet Our Expert Guides</h1>
                    <p className="text-secondary max-w-2xl mx-auto">
                        Connect with locals who know the island best to make your trip unforgettable.
                    </p>
                    <div className="mx-auto mt-4" style={{ maxWidth: '600px' }}>
                        <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">
                                <FaSearch className="text-secondary" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name, role, or location..."
                                className="border-start-0 shadow-none border-end-0 py-3"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="primary" className="fw-bold px-4 btn-primary-custom">Search</Button>
                        </InputGroup>
                    </div>
                </div>

                <Row>
                    {filteredGuides.map(guide => (
                        <Col md={6} lg={3} className="mb-4" key={guide.id}>
                            <div className="bg-white p-4 rounded-4 shadow-sm h-100 text-center card-hover position-relative" onClick={() => window.location.href = `/guides/${guide.id}`} style={{ cursor: 'pointer' }}>
                                <div className="mb-3 position-relative d-inline-block">
                                    <img
                                        src={guide.image}
                                        alt={guide.name}
                                        className="rounded-circle shadow-sm border border-3 border-white object-cover"
                                        style={{ width: '120px', height: '120px' }}
                                    />
                                    <div className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm p-1 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                                        <FaStar className="text-warning small" size={12} />
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-1 text-dark">{guide.name}</h5>
                                <p className="text-primary-custom small fw-bold mb-2">{guide.role}</p>
                                <p className="text-secondary small mb-3">{guide.location}</p>
                                <Button variant="outline-primary" size="sm" className="rounded-pill px-4">View Profile</Button>
                            </div>
                        </Col>
                    ))}
                    {filteredGuides.length === 0 && (
                        <Col className="text-center py-5">
                            <div className="text-secondary mb-3">
                                <FaSearch size={40} className="opacity-25" />
                            </div>
                            <h4>No guides found</h4>
                            <p className="text-secondary">Try adjusting your search criteria.</p>
                        </Col>
                    )}
                </Row>
            </Container>
            <Footer />
        </div>
    );
};

export default GuidesPage;
