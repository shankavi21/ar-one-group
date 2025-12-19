import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaHeart, FaStar, FaMapMarkerAlt, FaArrowLeft, FaSadTear } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';
import { getAllPackages, getSavedTrips, toggleSavedTrip } from '../services/firestoreService';

const SavedTripsPage = () => {
    const { user, formatPrice } = useApp(); // Get user and formatPrice from AppContext
    const [savedPackageIds, setSavedPackageIds] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedTrips = async () => {
            if (user?.uid) {
                setLoading(true);
                try {
                    const saved = await getSavedTrips(user.uid);
                    setSavedPackageIds(saved);
                } catch (error) {
                    console.error("Error loading saved trips", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchSavedTrips();
    }, [user]);

    const toggleSave = async (id) => {
        if (!user) return;
        try {
            const newSaved = await toggleSavedTrip(user.uid, id);
            setSavedPackageIds(newSaved);
            window.dispatchEvent(new Event('local-storage-update'));
        } catch (error) {
            console.error("Error removing saved trip:", error);
        }
    };

    const [allPackages, setAllPackages] = useState([]);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const packagesData = await getAllPackages();
                setAllPackages(packagesData);
            } catch (error) {
                console.error("Error loading packages", error);
            }
        };
        fetchPackages();
    }, []);

    const savedPackages = allPackages.filter(pkg => savedPackageIds.includes(pkg.id));

    return (
        <div className="min-vh-100 bg-light d-flex flex-column">
            <AppNavbar user={user} />
            <Container className="py-5 mt-5">
                <div className="mb-5 text-center position-relative">
                    <Button
                        variant="light"
                        onClick={() => window.location.href = '/home'}
                        className="position-absolute start-0 top-0 rounded-circle p-2 shadow-sm border-0 d-none d-lg-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <FaArrowLeft className="text-secondary" />
                    </Button>
                    <h1 className="fw-bold mb-3">Your Saved Trips</h1>
                    <p className="text-secondary">
                        <FaHeart className="text-danger me-2" />
                        Keep track of your dream vacations here.
                    </p>
                </div>

                <Row>
                    {loading ? (
                        <Col className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-secondary">Loading your secret escapes...</p>
                        </Col>
                    ) : savedPackages.length === 0 ? (
                        <Col className="text-center py-5">
                            <div className="text-secondary mb-3 opacity-25">
                                <FaSadTear size={60} />
                            </div>
                            <h4>No saved trips yet</h4>
                            <p className="text-secondary">Start exploring packages and tap the heart icon to save them!</p>
                            <Button href="/packages" variant="primary" className="mt-3 rounded-pill px-4 fw-bold btn-primary-custom">Explore Packages</Button>
                        </Col>
                    ) : (
                        savedPackages.map(pkg => (
                            <Col md={6} lg={3} className="mb-4" key={pkg.id}>
                                <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden card-hover" onClick={() => window.location.href = `/packages/${pkg.id}`} style={{ cursor: 'pointer' }}>
                                    <div className="position-relative">
                                        <Card.Img variant="top" src={pkg.image} style={{ height: '220px', objectFit: 'cover' }} />
                                        <Button
                                            variant="light"
                                            className="position-absolute top-0 end-0 m-2 rounded-circle p-2 shadow-sm border-0 d-flex align-items-center justify-content-center"
                                            style={{ width: '35px', height: '35px' }}
                                            onClick={(e) => { e.stopPropagation(); toggleSave(pkg.id); }}
                                        >
                                            <FaHeart className="text-danger" size={14} />
                                        </Button>
                                    </div>
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Badge bg="info" className="text-white fw-normal px-2 py-1 rounded-pill bg-primary-custom"><small>{pkg.duration}</small></Badge>
                                            <div className="d-flex align-items-center text-warning small">
                                                <FaStar className="me-1" /> {pkg.rating}
                                            </div>
                                        </div>
                                        <Card.Title className="fw-bold fs-6 mb-1">{pkg.title}</Card.Title>
                                        <div className="d-flex align-items-center text-secondary small mb-3">
                                            <FaMapMarkerAlt className="me-1 text-primary-custom" /> {pkg.location}
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            <div className="text-dark fw-bold">{formatPrice(pkg.price)}</div>
                                            <Button variant="outline-primary" size="sm" className="rounded-pill px-3 border-primary-custom text-primary-custom">View Details</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            </Container>
            <Footer />
        </div>
    );
};

export default SavedTripsPage;
