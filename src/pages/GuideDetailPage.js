import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card, ProgressBar, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaWhatsapp, FaArrowLeft, FaLanguage, FaBriefcase, FaUserCircle, FaQuoteLeft, FaClock, FaHiking, FaAward } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';
import { getGuide, getGuideReviews } from '../services/firestoreService';

const GuideDetailPage = () => {
    const { id } = useParams();
    const [guide, setGuide] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = auth.currentUser;

    useEffect(() => {
        const fetchGuideData = async () => {
            try {
                const data = await getGuide(id);
                if (data) {
                    setGuide(data);
                    // Also fetch reviews for this guide
                    const guideRev = await getGuideReviews(id);
                    setReviews(guideRev);
                } else {
                    setError("Guide not found");
                }
            } catch (err) {
                console.error("Error fetching guide:", err);
                setError("Failed to load guide details");
            } finally {
                setLoading(false);
            }
        };

        fetchGuideData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-vh-100 bg-light d-flex flex-column">
                <AppNavbar user={user} />
                <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <Spinner animation="border" variant="primary" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !guide) {
        return (
            <div className="min-vh-100 bg-light d-flex flex-column">
                <AppNavbar user={user} />
                <Container className="py-5 mt-5 text-center">
                    <Alert variant="danger">{error || "Something went wrong"}</Alert>
                    <Button as={Link} to="/guides" variant="primary" className="rounded-pill px-4">
                        Back to All Guides
                    </Button>
                </Container>
                <Footer />
            </div>
        );
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : guide.rating || '5.0';

    return (
        <div className="min-vh-100 bg-light d-flex flex-column">
            <AppNavbar user={user} />

            {/* Header Background */}
            <div className="bg-primary-custom py-5 pb-5 position-relative" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', height: '280px' }}>
                <Container>
                    <Button as={Link} to="/guides" variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center bg-white text-primary-custom mb-3 opacity-75 hover-opacity-100" style={{ width: '40px', height: '40px', transition: 'all 0.3s' }}>
                        <FaArrowLeft />
                    </Button>
                </Container>
            </div>

            <Container style={{ marginTop: '-150px', zIndex: 10 }}>
                <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-5">
                    <Card.Body className="p-0">
                        <Row className="g-0">
                            {/* Left Column: Image & Contact */}
                            <Col lg={4} className="bg-white border-end d-flex flex-column align-items-center p-5">
                                <div className="text-center w-100">
                                    <div className="position-relative d-inline-block mb-4">
                                        <img
                                            src={guide.image || 'https://via.placeholder.com/200'}
                                            alt={guide.name}
                                            className="rounded-circle shadow-lg border border-4 border-white object-cover"
                                            style={{ width: '220px', height: '220px' }}
                                        />
                                        <div className="position-absolute bottom-0 end-0 bg-success border border-4 border-white rounded-circle p-3 d-flex align-items-center justify-content-center shadow" style={{ width: '50px', height: '50px' }} title="Verified Guide">
                                            <FaAward className="text-white" size={20} />
                                        </div>
                                    </div>

                                    <h2 className="fw-bold mb-1 font-serif">{guide.name}</h2>
                                    <p className="text-primary-custom fw-bold mb-3 fs-5 text-uppercase" style={{ letterSpacing: '1px' }}>{guide.role}</p>

                                    <div className="d-flex justify-content-center align-items-center mb-4 gap-2">
                                        <div className="d-flex align-items-center bg-warning bg-opacity-10 px-3 py-1 rounded-pill border border-warning border-opacity-25">
                                            <FaStar className="text-warning me-1" />
                                            <span className="fw-bold text-dark">{avgRating}</span>
                                        </div>
                                        <span className="text-muted small">({reviews.length} Reviews)</span>
                                    </div>

                                    <div className="d-grid gap-3">
                                        <Button
                                            variant="success"
                                            className="rounded-pill fw-bold py-3 shadow-sm d-flex align-items-center justify-content-center"
                                            size="lg"
                                            onClick={() => {
                                                const rawPhone = (guide.phone || '').replace(/[^0-9]/g, '');
                                                let formattedPhone = rawPhone;
                                                // Handle Sri Lanka local format (e.g., 07XXXXXXXX)
                                                if (rawPhone.startsWith('0')) {
                                                    formattedPhone = '94' + rawPhone.substring(1);
                                                } else if (rawPhone.length === 9 && !rawPhone.startsWith('94')) {
                                                    formattedPhone = '94' + rawPhone;
                                                }

                                                const message = encodeURIComponent(`Hello ${guide.name}! I found your profile on AR One Tourism and would like to inquire about your guiding services.`);
                                                window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
                                            }}
                                        >
                                            <FaWhatsapp className="me-2" size={20} /> Contact Now
                                        </Button>
                                        <Button variant="outline-primary" className="rounded-pill fw-bold py-2 border-2">
                                            Follow Profile
                                        </Button>
                                    </div>

                                    <hr className="my-4 opacity-25" />

                                    <div className="text-start">
                                        <h6 className="fw-bold mb-3 text-secondary text-uppercase" style={{ fontSize: '11px', letterSpacing: '2px' }}>Vitals</h6>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-light rounded-circle p-2 me-3"><FaMapMarkerAlt className="text-primary-custom" size={14} /></div>
                                            <span className="text-secondary small fw-medium">{guide.location}</span>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-light rounded-circle p-2 me-3"><FaBriefcase className="text-primary-custom" size={14} /></div>
                                            <span className="text-secondary small fw-medium">{guide.experience || '8+ Years'} Experience</span>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-light rounded-circle p-2 me-3"><FaLanguage className="text-primary-custom" size={14} /></div>
                                            <span className="text-secondary small fw-medium">{guide.languages?.join(', ') || 'English, Sinhala'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            {/* Right Column: Bio & Reviews */}
                            <Col lg={8} className="p-4 p-md-5 bg-classic">
                                <div className="animate__animated animate__fadeIn">
                                    <h4 className="fw-bold mb-4 d-flex align-items-center font-serif">
                                        <FaUserCircle className="me-2 text-primary-custom opacity-50" /> The Story of {guide.name.split(' ')[0]}
                                    </h4>
                                    <p className="text-secondary mb-5 fs-5 font-serif" style={{ lineHeight: '1.8', fontStyle: 'italic' }}>
                                        {guide.bio || "This guide is a verified local expert in Sri Lanka. With years of experience and deep knowledge of the island's hidden gems, culture, and history, they are dedicated to providing you with an authentic and unforgettable travel experience."}
                                    </p>

                                    <Row className="mb-5 g-4 text-center">
                                        <Col xs={4}>
                                            <div className="p-4 bg-white rounded-4 shadow-sm h-100 border border-light">
                                                <h3 className="fw-bold text-primary-custom mb-0 font-serif">98%</h3>
                                                <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px' }}>Reviews</small>
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="p-4 bg-white rounded-4 shadow-sm h-100 border border-light">
                                                <h3 className="fw-bold text-primary-custom mb-0 font-serif">2.5k+</h3>
                                                <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px' }}>Trailers</small>
                                            </div>
                                        </Col>
                                        <Col xs={4}>
                                            <div className="p-4 bg-white rounded-4 shadow-sm h-100 border border-light">
                                                <h3 className="fw-bold text-primary-custom mb-0 font-serif">15</h3>
                                                <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px' }}>Awards</small>
                                            </div>
                                        </Col>
                                    </Row>

                                    <h5 className="fw-bold mb-4 font-serif">Expertise Areas</h5>
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between small mb-2">
                                            <span className="text-dark fw-bold">Storytelling & History</span>
                                            <span className="fw-bold text-primary-custom">100%</span>
                                        </div>
                                        <ProgressBar variant="info" now={100} style={{ height: '6px' }} className="rounded-pill bg-white shadow-sm" />
                                    </div>
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between small mb-2">
                                            <span className="text-dark fw-bold">Jungle Navigation</span>
                                            <span className="fw-bold text-primary-custom">94%</span>
                                        </div>
                                        <ProgressBar variant="info" now={94} style={{ height: '6px' }} className="rounded-pill bg-white shadow-sm" />
                                    </div>
                                    <div className="mb-5">
                                        <div className="d-flex justify-content-between small mb-2">
                                            <span className="text-dark fw-bold">Travel Safety</span>
                                            <span className="fw-bold text-primary-custom">98%</span>
                                        </div>
                                        <ProgressBar variant="info" now={98} style={{ height: '6px' }} className="rounded-pill bg-white shadow-sm" />
                                    </div>

                                    {/* Real Reviews Section */}
                                    <div className="d-flex align-items-center justify-content-between mb-4 mt-5">
                                        <h5 className="fw-bold mb-0 font-serif">Testimonials</h5>
                                        <Badge bg="white" text="dark" className="border px-3 py-2 rounded-pill shadow-sm small">
                                            {reviews.length} Experiences Shared
                                        </Badge>
                                    </div>

                                    {reviews.length > 0 ? (
                                        <div className="d-flex flex-column gap-4">
                                            {reviews.map((rev) => (
                                                <div key={rev.id} className="p-4 bg-white rounded-4 shadow-sm card-classic border-0 position-relative border-start border-4 border-info">
                                                    <FaQuoteLeft className="quote-icon position-absolute top-0 end-0 m-3" size={30} />
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className="bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                                                <FaUserCircle className="text-secondary opacity-50" size={24} />
                                                            </div>
                                                            <div>
                                                                <h6 className="fw-bold mb-0 font-serif">{rev.userName}</h6>
                                                                <div className="d-flex gap-1 text-warning mt-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <FaStar key={i} size={10} className={i < rev.rating ? 'text-warning' : 'text-light'} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <small className="text-muted fw-bold text-uppercase border-bottom" style={{ fontSize: '9px' }}>Verified Trip</small>
                                                    </div>
                                                    <p className="text-secondary mb-0 font-serif italic" style={{ lineHeight: '1.7' }}>
                                                        "{rev.comment}"
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5 bg-white rounded-4 border border-dashed card-classic">
                                            <p className="text-muted mb-2 font-serif">No stories have been shared about {guide.name.split(' ')[0]} yet.</p>
                                            <Link to="/guides" className="small text-primary-custom fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Be the first storyteller</Link>
                                        </div>
                                    )}

                                    <div className="mt-5 p-4 bg-primary bg-opacity-10 rounded-4 border border-primary border-opacity-10">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-white p-2 rounded-circle me-3 shadow-sm border border-primary border-opacity-25">
                                                <FaHiking className="text-primary-custom" size={20} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1 font-serif">Vetted & Verified</h6>
                                                <p className="text-secondary small mb-0 opacity-75">
                                                    Our guides are hand-picked for their local expertise and passion. All reviews are from confirmed travelers.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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
