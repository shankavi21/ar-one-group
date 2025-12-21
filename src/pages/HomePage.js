import React from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { FaSearch, FaHeart, FaStar, FaMapMarkerAlt, FaShieldAlt, FaUserCheck, FaTags, FaTree, FaUmbrellaBeach, FaLandmark, FaMountain } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';
import { getAllPackages, getAllGuides, getApprovedReviews, addReview, getAllOffers, getSavedTrips, toggleSavedTrip } from '../services/firestoreService';

const HomePage = () => {
    // Basic User Auth Check
    const { user, userProfile, loadingUser, formatPrice } = useApp(); // Use AppContext user
    const [searchTerm, setSearchTerm] = React.useState('');
    const [savedPackageIds, setSavedPackageIds] = React.useState([]);
    const [reviews, setReviews] = React.useState([]);
    const [newReview, setNewReview] = React.useState('');
    const [selectedRating, setSelectedRating] = React.useState(0);
    const [hoverRating, setHoverRating] = React.useState(0);
    const packagesSectionRef = React.useRef(null);

    // Data from Firestore
    const [popularDestinations, setPopularDestinations] = React.useState([
        { id: 1, name: 'Sigiriya', count: 'Loading...', image: '/sigiriya.png', icon: <FaLandmark /> },
        { id: 2, name: 'Ella', count: 'Loading...', image: '/ella.png', icon: <FaMountain /> },
        { id: 3, name: 'Mirissa', count: 'Loading...', image: '/beach.png', icon: <FaUmbrellaBeach /> },
        { id: 4, name: 'Yala', count: 'Loading...', image: '/yala.jpg', icon: <FaTree /> },
    ]);
    const [packages, setPackages] = React.useState([]);
    const [guides, setGuides] = React.useState([]);
    const [offers, setOffers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [packagesData, guidesData, reviewsData, offersData] = await Promise.all([
                    getAllPackages(),
                    getAllGuides(),
                    getApprovedReviews(),
                    getAllOffers()
                ]);

                setPackages(packagesData.slice(0, 4)); // Show top 4
                setGuides(guidesData); // Show all guides dynamically
                setReviews(reviewsData.slice(0, 3)); // Show top 3 reviews

                // Filter active offers
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const activeOffers = offersData.filter(o => {
                    if (o.status !== 'active') return false;
                    if (!o.validUntil) return true;
                    // Create date from string to treat as local 00:00
                    const validDate = new Date(o.validUntil);
                    // Add 1 day to make it expire at the END of the selected day
                    validDate.setDate(validDate.getDate() + 1);
                    return validDate > new Date(); // Compare with current time
                });
                setOffers(activeOffers);

                // Update Destination Counts
                const newDestinations = [
                    { id: 1, name: 'Sigiriya', count: `${packagesData.filter(p => p.location.toLowerCase().includes('sigiriya')).length} Packages`, image: '/sigiriya.png', icon: <FaLandmark /> },
                    { id: 2, name: 'Ella', count: `${packagesData.filter(p => p.location.toLowerCase().includes('ella')).length} Packages`, image: '/ella.png', icon: <FaMountain /> },
                    { id: 3, name: 'Mirissa', count: `${packagesData.filter(p => p.location.toLowerCase().includes('mirissa')).length} Packages`, image: '/beach.png', icon: <FaUmbrellaBeach /> },
                    { id: 4, name: 'Yala', count: `${packagesData.filter(p => p.location.toLowerCase().includes('yala')).length} Packages`, image: '/yala.jpg', icon: <FaTree /> },
                ];
                setPopularDestinations(newDestinations);
            } catch (error) {
                console.error("Error loading home data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    React.useEffect(() => {
        const loadSaved = async () => {
            if (user?.uid) {
                const saved = await getSavedTrips(user.uid);
                setSavedPackageIds(saved);
            } else {
                setSavedPackageIds([]);
            }
        };

        loadSaved();
        // Still listen for local updates if needed, but primary is Firestore
        window.addEventListener('local-storage-update', loadSaved);
        return () => window.removeEventListener('local-storage-update', loadSaved);
    }, [user]);

    const toggleSave = async (id) => {
        if (!user) {
            alert("Please login to save your favorite trips!");
            navigate('/login');
            return;
        }

        try {
            const newSaved = await toggleSavedTrip(user.uid, id);
            setSavedPackageIds(newSaved);
            window.dispatchEvent(new Event('local-storage-update'));
        } catch (error) {
            console.error("Error toggling save:", error);
        }
    };

    const handleDestinationClick = (name) => {
        setSearchTerm(name);
        if (packagesSectionRef.current) {
            packagesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (selectedRating === 0) {
            alert('Please select a star rating before submitting your review.');
            return;
        }

        if (!user) {
            alert('You must be logged in to submit a review.');
            return;
        }

        if (newReview.trim()) {
            try {
                const reviewData = {
                    userName: userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
                    userEmail: user?.email || '',
                    userPhoto: userProfile?.photoURL || user?.photoURL || '',
                    packageName: 'General Site Review',
                    packageId: null,
                    name: userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
                    country: 'Global Traveler',
                    comment: newReview,
                    rating: selectedRating
                };

                await addReview(reviewData);

                setNewReview('');
                setSelectedRating(0);
                setHoverRating(0);
                alert('Thank you for your review! It will be published after admin approval.');
            } catch (error) {
                console.error("Error submitting review", error);
                alert("Failed to submit review. Please try again.");
            }
        }
    };

    // Destinations are now dynamic
    // Packages and Guides are now fetched from Firestore

    const filteredPackages = packages.filter(pkg =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGuides = guides.filter(guide =>
        guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-vh-100 bg-light d-flex flex-column">
            <AppNavbar user={user} />

            {/* Hero Section */}
            <div className="text-white py-5 position-relative overflow-hidden" style={{
                background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero_bg.png') no-repeat center center/cover`,
                minHeight: '600px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Container className="position-relative" style={{ zIndex: 1 }}>
                    <Row className="justify-content-center text-center">
                        <Col md={8}>
                            <h1 className="display-4 fw-bold mb-3">Discover the Wonder of Asia</h1>
                            <p className="lead opacity-85 mb-5 fs-4">
                                Explore the breathtaking beauty, rich culture, and serene landscapes of Sri Lanka with Ar One.
                            </p>

                            {/* Search Bar */}
                            <div className="bg-white p-2 rounded-pill shadow-lg mx-auto" style={{ maxWidth: '700px' }}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-transparent border-0 ps-4">
                                        <FaSearch className="text-secondary" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search Packages, Guides, or Locations..."
                                        className="border-0 shadow-none bg-transparent form-control-lg"
                                        aria-label="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Button variant="primary" className="rounded-pill btn-primary-custom px-5 fw-bold">
                                        Search
                                    </Button>
                                </InputGroup>
                            </div>
                        </Col>
                    </Row>
                </Container>

            </div>



            {/* Why Choose Us Section */}
            <section className="py-5">
                <Container>
                    <Row className="g-4">
                        <Col md={4}>
                            <div className="p-4 bg-white rounded-4 shadow-sm h-100 text-center border-bottom border-4 border-primary-custom">
                                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-primary-custom" style={{ width: '70px', height: '70px' }}>
                                    <FaShieldAlt size={30} />
                                </div>
                                <h4 className="fw-bold mb-2">Trusted & Safe</h4>
                                <p className="text-secondary small mb-0">We verify all our guides and partners to ensure your safety and peace of mind during your travels.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-4 bg-white rounded-4 shadow-sm h-100 text-center border-bottom border-4 border-warning">
                                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-warning" style={{ width: '70px', height: '70px' }}>
                                    <FaUserCheck size={30} />
                                </div>
                                <h4 className="fw-bold mb-2">Expert Local Guides</h4>
                                <p className="text-secondary small mb-0">Connect with passionate locals who know the hidden gems and stories of Sri Lanka.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-4 bg-white rounded-4 shadow-sm h-100 text-center border-bottom border-4 border-info">
                                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-info" style={{ width: '70px', height: '70px' }}>
                                    <FaTags size={30} />
                                </div>
                                <h4 className="fw-bold mb-2">Best Price Guarantee</h4>
                                <p className="text-secondary small mb-0">Get the best value for your money with our transparent pricing and curated packages.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Popular Destinations Section */}
            <section className="py-5 bg-white">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-dark">Popular Destinations</h2>
                        <p className="text-secondary">Explore the most visited places in the pearl of the Indian Ocean</p>
                    </div>
                    <Row className="g-3">
                        {popularDestinations.map(dest => (
                            <Col md={6} lg={3} key={dest.id}>
                                <div
                                    className="position-relative rounded-4 overflow-hidden shadow-sm h-100 group-hover-zoom"
                                    style={{ minHeight: '250px' }}
                                >
                                    <img src={dest.image} alt={dest.name} className="object-cover w-100 h-100" style={{ transition: 'transform 0.3s' }} />
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                                        <div className="text-white">
                                            <div className="mb-2">{dest.icon}</div>
                                            <h5 className="fw-bold mb-0">{dest.name}</h5>
                                            <small className="opacity-75">{dest.count}</small>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Packages Section */}
            <section className="py-5" ref={packagesSectionRef}>
                <Container>
                    <div className="d-flex justify-content-between align-items-end mb-4">
                        <div>
                            <h2 className="fw-bold text-dark mb-1">Top Tour Packages</h2>
                            <p className="text-secondary mb-0">Best experiences curated just for you.</p>
                        </div>
                        <Button href="/packages" variant="link" className="text-primary-custom fw-bold text-decoration-none">View All</Button>
                    </div>

                    <Row>
                        {filteredPackages.map(pkg => (
                            <Col md={6} lg={3} className="mb-4" key={pkg.id}>
                                <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden card-hover" onClick={() => window.location.href = `/packages/${pkg.id}`} style={{ cursor: 'pointer' }}>
                                    <div className="position-relative">
                                        <Card.Img variant="top" src={pkg.image} style={{ height: '200px', objectFit: 'cover' }} />
                                        <Button
                                            variant="light"
                                            className="position-absolute top-0 end-0 m-2 rounded-circle p-2 shadow-sm border-0 d-flex align-items-center justify-content-center"
                                            style={{ width: '35px', height: '35px' }}
                                            onClick={(e) => { e.stopPropagation(); toggleSave(pkg.id); }}
                                        >
                                            <FaHeart className={savedPackageIds.includes(pkg.id) ? "text-danger" : "text-secondary"} size={14} />
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
                                            <div className="text-primary-custom fw-bold">{formatPrice(pkg.price)}</div>
                                            <Button variant="outline-primary" size="sm" className="rounded-pill px-3 border-primary-custom text-primary-custom">View</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                        {filteredPackages.length === 0 && (
                            <Col className="text-center py-5">
                                <p className="text-secondary">No packages found matching your search.</p>
                            </Col>
                        )}
                    </Row>
                </Container>
            </section>

            {/* Guides Section */}
            <section className="py-5 bg-light-subtle">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-dark mb-2">Meet Our Expert Local Guides</h2>
                        <p className="text-secondary">Connect with locals who know the island best.</p>
                    </div>

                    <Row className="justify-content-center">
                        {filteredGuides.map(guide => (
                            <Col xs={6} md={4} lg={2} className="mb-4 text-center" key={guide.id}>
                                <div className="mb-3 position-relative d-inline-block" onClick={() => window.location.href = `/guides/${guide.id}`} style={{ cursor: 'pointer' }}>
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
                                <h6 className="fw-bold mb-0 text-dark">{guide.name}</h6>
                                <p className="small text-secondary mb-0">{guide.role}</p>
                            </Col>
                        ))}
                        {filteredGuides.length === 0 && (
                            <Col className="text-center py-5">
                                <p className="text-secondary">No guides found matching your search.</p>
                            </Col>
                        )}
                    </Row>
                    <div className="text-center mt-4">
                        <Button href="/guides" variant="outline-dark" className="rounded-pill px-4">View All Guides</Button>
                    </div>
                </Container>
            </section>

            {/* Exclusive Offers Section */}
            {
                offers.length > 0 && (
                    <section className="py-5 bg-white">
                        <Container>
                            <div className="text-center mb-4">
                                <Badge bg="danger" className="mb-2">Limited Time Deals</Badge>
                                <h2 className="fw-bold">Exclusive Offers</h2>
                            </div>
                            <Row className="justify-content-center">
                                {offers.map(offer => (
                                    <Col md={6} lg={4} key={offer.id} className="mb-4">
                                        <div className="d-flex align-items-center bg-light rounded-4 p-4 shadow-sm border border-danger position-relative overflow-hidden h-100">
                                            {/* Decorative background circle */}
                                            <div className="position-absolute rounded-circle bg-danger opacity-10" style={{ top: '-20px', right: '-20px', width: '100px', height: '100px' }}></div>

                                            <div className="flex-grow-1 position-relative z-1">
                                                <h4 className="fw-bold text-danger mb-1">{offer.title}</h4>
                                                <h3 className="fw-bold mb-2">{offer.discount}</h3>
                                                <p className="text-muted small mb-3">{offer.description}</p>
                                                {offer.code && (
                                                    <div className="d-inline-block bg-white border border-danger border-dashed px-3 py-1 rounded fw-bold text-danger">
                                                        Use Code: {offer.code}
                                                    </div>
                                                )}
                                                {offer.validUntil && (
                                                    <div className="mt-2 text-secondary small">
                                                        Expires: {new Date(offer.validUntil).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 ms-3">
                                                <FaTags size={40} className="text-danger opacity-50" />
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Container>
                    </section>
                )
            }

            {/* Reviews Section */}
            <section className="py-5">
                <Container>
                    <h2 className="fw-bold text-dark mb-4 text-center">What Travelers Say</h2>
                    <Row className="mb-5">
                        {reviews.map(review => (
                            <Col md={4} className="mb-4" key={review.id}>
                                <Card className="border-0 shadow-sm p-4 h-100 rounded-4">
                                    <div className="d-flex text-warning mb-3">
                                        {[...Array(Number(review.rating) || 5)].map((_, i) => <FaStar key={i} />)}
                                    </div>
                                    <p className="text-secondary italic mb-4">"{review.comment}"</p>
                                    <div className="d-flex align-items-center mt-auto">
                                        {review.userPhoto ? (
                                            <img src={review.userPhoto} alt={review.name} className="rounded-circle shadow-sm" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '40px', height: '40px' }}>
                                                {(review.name || review.userName || 'A').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="ms-3">
                                            <h6 className="fw-bold mb-0 small">{review.name || review.userName || 'Anonymous'}</h6>
                                            <p className="text-muted small mb-0">From {review.country || 'Global Traveler'}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Write Review Form */}
                    {user && (
                        <div className="bg-white p-4 rounded-4 shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
                            <h4 className="fw-bold mb-3 text-center">Write a Review</h4>
                            <Form onSubmit={handleReviewSubmit}>
                                {/* Star Rating Selector */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Your Rating <span className="text-danger">*</span></Form.Label>
                                    <div className="d-flex align-items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                size={32}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                className={
                                                    star <= (hoverRating || selectedRating)
                                                        ? 'text-warning'
                                                        : 'text-muted'
                                                }
                                                onClick={() => setSelectedRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                            />
                                        ))}
                                        {selectedRating > 0 && (
                                            <span className="ms-2 text-secondary">
                                                {selectedRating} {selectedRating === 1 ? 'star' : 'stars'}
                                            </span>
                                        )}
                                    </div>
                                    {selectedRating === 0 && (
                                        <Form.Text className="text-muted">
                                            Click on the stars to rate (1 = Poor, 5 = Excellent)
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                {/* Review Text */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Your Review <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Share your experience..."
                                        value={newReview}
                                        onChange={(e) => setNewReview(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <div className="text-center">
                                    <Button variant="primary" type="submit" className="btn-primary-custom rounded-pill px-4">Submit Review</Button>
                                </div>
                            </Form>
                        </div>
                    )}
                </Container>
            </section>

            <Footer />
        </div >
    );
};

export default HomePage;
