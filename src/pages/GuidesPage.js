import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaStar, FaArrowLeft, FaQuoteLeft, FaPaperPlane, FaUserAlt, FaCheckCircle, FaAward } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';
import { getAllGuides, getApprovedReviews, addReview } from '../services/firestoreService';

const GuidesPage = () => {
    const user = auth.currentUser;
    const [searchTerm, setSearchTerm] = useState('');
    const [guides, setGuides] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review Form State
    const [submitting, setSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({
        guideId: '',
        rating: 5,
        comment: '',
        userName: user?.displayName || ''
    });
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const guideData = await getAllGuides();
                const approvedGuides = guideData.filter(g => !g.status || g.status === 'approved');
                setGuides(approvedGuides);

                const reviewData = await getApprovedReviews();
                // Filter specifically for guide reviews, taking the latest 6
                setReviews(reviewData.filter(r => r.guideId).sort((a, b) => b.createdAt - a.createdAt).slice(0, 6));
            } catch (error) {
                console.error("Error loading data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.guideId || !newReview.comment) {
            alert("Please select a guide and write your review.");
            return;
        }

        setSubmitting(true);
        try {
            const selectedGuide = guides.find(g => g.id === newReview.guideId);
            await addReview({
                ...newReview,
                guideName: selectedGuide?.name || 'Unknown Guide',
                status: 'pending',
                userId: user?.uid || null,
                userEmail: user?.email || 'N/A',
                date: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
            setSubmitSuccess(true);
            setNewReview({ guideId: '', rating: 5, comment: '', userName: user?.displayName || '' });
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

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
                    <h1 className="fw-bold mb-3 font-serif display-4">Meet Our Expert Guides</h1>
                    <p className="text-secondary max-w-2xl mx-auto lead">
                        Connect with locals who know the island best to make your trip unforgettable.
                    </p>
                    <div className="mx-auto mt-4" style={{ maxWidth: '600px' }}>
                        <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                            <InputGroup.Text className="bg-white border-0 ps-4">
                                <FaSearch className="text-secondary" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name, role, or location..."
                                className="border-0 shadow-none py-3"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="primary" className="fw-bold px-4 btn-primary-custom border-0 ms-0">Search</Button>
                        </InputGroup>
                    </div>
                </div>

                <Row className="g-4">
                    {filteredGuides.map(guide => (
                        <Col md={6} lg={3} key={guide.id}>
                            <div className="card-classic p-4 rounded-4 h-100 text-center position-relative">
                                <div className="mb-3 position-relative d-inline-block">
                                    <img
                                        src={guide.image || 'https://via.placeholder.com/150'}
                                        alt={guide.name}
                                        className="rounded-circle shadow-sm border border-4 border-white object-cover"
                                        style={{ width: '130px', height: '130px' }}
                                    />
                                    <div className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                                        <FaAward className="text-primary-custom" size={16} />
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-1 text-dark font-serif">{guide.name}</h5>
                                <p className="text-primary-custom small fw-bold mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>{guide.role}</p>
                                <p className="text-secondary small mb-4">{guide.location}</p>
                                <Link to={`/guides/${guide.id}`}>
                                    <Button variant="outline-primary" size="sm" className="rounded-pill px-4 fw-bold">View Profile</Button>
                                </Link>
                            </div>
                        </Col>
                    ))}
                    {filteredGuides.length === 0 && (
                        <Col className="text-center py-5">
                            <div className="text-secondary mb-3">
                                <FaSearch size={40} className="opacity-25" />
                            </div>
                            <h4 className="font-serif">No guides found</h4>
                            <p className="text-secondary">Try adjusting your search criteria.</p>
                        </Col>
                    )}
                </Row>
            </Container>

            {/* Elegant Reviews Section */}
            <section className="py-5 bg-classic border-top mt-5">
                <Container className="py-5">
                    <Row className="justify-content-center text-center mb-5">
                        <Col lg={8}>
                            <h6 className="text-primary-custom fw-bold text-uppercase mb-2" style={{ letterSpacing: '2px' }}>Voices of Travelers</h6>
                            <h2 className="display-6 fw-bold mb-3 font-serif">Guide Testimonials</h2>
                            <div className="separator-classic"></div>
                        </Col>
                    </Row>

                    <Row className="g-4 mb-5">
                        {reviews.length > 0 ? (
                            reviews.map((rev) => (
                                <Col md={4} key={rev.id}>
                                    <div className="h-100 p-5 bg-white rounded-4 card-classic position-relative d-flex flex-column">
                                        <FaQuoteLeft className="quote-icon position-absolute top-0 start-0 m-4" size={50} />
                                        <div className="mb-3 position-relative" style={{ zIndex: 1 }}>
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} size={14} className={i < rev.rating ? 'text-warning' : 'text-light'} />
                                            ))}
                                        </div>
                                        <p className="text-secondary font-italic flex-grow-1 position-relative" style={{ fontSize: '1.1rem', lineHeight: '1.8', zIndex: 1 }}>
                                            "{rev.comment}"
                                        </p>
                                        <div className="mt-4 pt-4 border-top d-flex align-items-center">
                                            <div className="bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                                <FaUserAlt className="text-secondary opacity-50" />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-0 font-serif">{rev.userName}</h6>
                                                <small className="text-primary-custom fw-bold text-uppercase" style={{ fontSize: '10px' }}>With {rev.guideName}</small>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            ))
                        ) : (
                            <Col className="text-center py-4">
                                <p className="text-muted font-serif italic">No stories shared yet. Be the first to tell us about your journey.</p>
                            </Col>
                        )}
                    </Row>

                    {/* Review Form - Classic Design */}
                    <Row className="justify-content-center pt-4">
                        <Col lg={8}>
                            <div className="bg-white p-5 rounded-4 shadow-sm border card-classic">
                                <h3 className="fw-bold mb-4 text-center font-serif">Leave Your Impression</h3>
                                {submitSuccess ? (
                                    <div className="alert alert-success text-center py-5 rounded-4 border-0 shadow-sm animate__animated animate__zoomIn">
                                        <FaCheckCircle className="mb-3 text-success" size={50} />
                                        <h4 className="fw-bold font-serif">Thank You!</h4>
                                        <p className="mb-0 lead">Your review has been submitted for approval. We appreciate your feedback!</p>
                                    </div>
                                ) : (
                                    <Form onSubmit={handleReviewSubmit}>
                                        <Row className="g-4">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-muted text-uppercase" style={{ letterSpacing: '1px' }}>Your Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter your name (e.g. Vaishu)"
                                                        className="py-3 border-2 shadow-none rounded-3"
                                                        value={newReview.userName}
                                                        onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-muted text-uppercase" style={{ letterSpacing: '1px' }}>Your Guide</Form.Label>
                                                    <Form.Select
                                                        className="py-3 border-2 shadow-none rounded-3"
                                                        value={newReview.guideId}
                                                        onChange={(e) => setNewReview({ ...newReview, guideId: e.target.value })}
                                                        required
                                                    >
                                                        <option value="">Select a guide...</option>
                                                        {guides.map(g => (
                                                            <option key={g.id} value={g.id}>{g.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-muted text-uppercase" style={{ letterSpacing: '1px' }}>Your Rating</Form.Label>
                                                    <div className="d-flex gap-2 py-2">
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <FaStar
                                                                key={num}
                                                                size={28}
                                                                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                                                className={num <= newReview.rating ? 'text-warning scale-hover' : 'text-light scale-hover'}
                                                                onClick={() => setNewReview({ ...newReview, rating: num })}
                                                            />
                                                        ))}
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-muted text-uppercase" style={{ letterSpacing: '1px' }}>Tour Experience</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={5}
                                                        placeholder="Write your story here..."
                                                        className="py-3 px-4 border-2 shadow-none rounded-3"
                                                        value={newReview.comment}
                                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                        required
                                                        style={{ resize: 'none' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12} className="text-center pt-2">
                                                <Button
                                                    type="submit"
                                                    variant="dark"
                                                    size="lg"
                                                    className="px-5 py-3 rounded-pill fw-bold shadow-sm"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? 'Submitting...' : <><FaPaperPlane className="me-2" /> Share My Experience</>}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <Footer />
        </div>
    );
};

export default GuidesPage;
