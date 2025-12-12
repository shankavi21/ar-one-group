import React from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { FaSearch, FaHeart, FaStar, FaMapMarkerAlt, FaShieldAlt, FaUserCheck, FaTags, FaTree, FaUmbrellaBeach, FaLandmark, FaMountain } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';

const HomePage = () => {
    // Basic User Auth Check
    const user = auth.currentUser;
    const { formatPrice } = useApp(); // Get formatPrice for currency conversion
    const [searchTerm, setSearchTerm] = React.useState('');
    const [savedPackageIds, setSavedPackageIds] = React.useState([]);
    const [reviews, setReviews] = React.useState([]);
    const [newReview, setNewReview] = React.useState('');
    const [selectedRating, setSelectedRating] = React.useState(0); // Star rating state
    const [hoverRating, setHoverRating] = React.useState(0); // For hover effect
    const packagesSectionRef = React.useRef(null);

    React.useEffect(() => {
        const loadSaved = () => {
            const saved = JSON.parse(localStorage.getItem('savedTrips') || '[]');
            setSavedPackageIds(saved);
        };

        // Load only approved reviews
        const loadApprovedReviews = () => {
            const allReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            const approvedReviews = allReviews.filter(review => review.status === 'approved');
            setReviews(approvedReviews);
        };

        loadSaved();
        loadApprovedReviews();

        const handleStorageChange = () => {
            loadSaved();
            loadApprovedReviews();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage-update', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage-update', handleStorageChange);
        };
    }, []);

    const toggleSave = (id) => {
        let newSaved;
        if (savedPackageIds.includes(id)) {
            newSaved = savedPackageIds.filter(pid => pid !== id);
        } else {
            newSaved = [...savedPackageIds, id];
        }
        setSavedPackageIds(newSaved);
        localStorage.setItem('savedTrips', JSON.stringify(newSaved));
        window.dispatchEvent(new Event('local-storage-update'));
    };

    const handleDestinationClick = (name) => {
        setSearchTerm(name);
        if (packagesSectionRef.current) {
            packagesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();

        // Validate rating
        if (selectedRating === 0) {
            alert('Please select a star rating before submitting your review.');
            return;
        }

        if (newReview.trim()) {
            // Get existing reviews from localStorage
            const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');

            const review = {
                id: Date.now(),
                userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                userEmail: user.email || '',
                packageName: 'General Review', // Can be customized per package
                packageId: null,
                name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                country: 'Global Traveler',
                comment: newReview,
                rating: selectedRating, // Use selected rating instead of hardcoded 5
                date: new Date().toISOString(),
                status: 'pending' // All new reviews are pending by default
            };

            // Save to localStorage for admin review
            const updatedReviews = [review, ...existingReviews];
            localStorage.setItem('reviews', JSON.stringify(updatedReviews));

            // Reset form
            setNewReview('');
            setSelectedRating(0);
            setHoverRating(0);
            alert('Thank you for your review! It will be published after admin approval.');
        }
    };

    // Mock Data
    const popularDestinations = [
        { id: 1, name: 'Sigiriya', count: '15 Packages', image: '/sigiriya.png', icon: <FaLandmark /> },
        { id: 2, name: 'Ella', count: '12 Packages', image: '/ella.png', icon: <FaMountain /> },
        { id: 3, name: 'Mirissa', count: '8 Packages', image: '/beach.png', icon: <FaUmbrellaBeach /> },
        { id: 4, name: 'Yala', count: '10 Packages', image: '/yala.jpg', icon: <FaTree /> },
    ];

    // Prices stored as numbers in LKR for proper conversion
    const packages = [
        { id: 1, title: 'Sigiriya Adventure', location: 'Sigiriya, Sri Lanka', price: 45000, duration: '3 Days', image: '/sigiriya.png', rating: 4.8 },
        { id: 2, title: 'Ella Hill Climb', location: 'Ella, Sri Lanka', price: 35000, duration: '2 Days', image: '/ella.png', rating: 4.9 },
        { id: 3, title: 'Coastal Bliss', location: 'Mirissa, Sri Lanka', price: 60000, duration: '4 Days', image: '/beach.png', rating: 4.7 },
        { id: 4, title: 'Cultural Triangle', location: 'Kandy, Sri Lanka', price: 55000, duration: '3 Days', image: '/kandy.jpg', rating: 4.6 },
    ];

    const guides = [
        { id: 1, name: 'Saman Perera', role: 'Cultural Expert', image: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 4.9 },
        { id: 2, name: 'Nimali Silva', role: 'Wildlife Guide', image: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 4.8 },
        { id: 3, name: 'Kumar Sangak', role: 'Adventure Lead', image: 'https://randomuser.me/api/portraits/men/22.jpg', rating: 5.0 },
        { id: 4, name: 'Dinesh Chandimal', role: 'Historian', image: 'https://randomuser.me/api/portraits/men/15.jpg', rating: 4.7 },
        { id: 5, name: 'Chathurika', role: 'Eco-Tourism', image: 'https://randomuser.me/api/portraits/women/65.jpg', rating: 4.9 },
        { id: 6, name: 'Roshan Mahanama', role: 'Food Tour Guide', image: 'https://randomuser.me/api/portraits/men/50.jpg', rating: 4.8 },
    ];

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

            {/* Reviews Section */}
            <section className="py-5">
                <Container>
                    <h2 className="fw-bold text-dark mb-4 text-center">What Travelers Say</h2>
                    <Row className="mb-5">
                        {reviews.map(review => (
                            <Col md={4} className="mb-4" key={review.id}>
                                <Card className="border-0 shadow-sm p-4 h-100 rounded-4">
                                    <div className="d-flex text-warning mb-3">
                                        {[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}
                                    </div>
                                    <p className="text-secondary italic mb-4">"{review.comment}"</p>
                                    <div className="d-flex align-items-center mt-auto">
                                        <div className="bg-secondary rounded-circle" style={{ width: '40px', height: '40px' }}></div>
                                        <div className="ms-3">
                                            <h6 className="fw-bold mb-0 small">{review.name}</h6>
                                            <p className="text-muted small mb-0">From {review.country}</p>
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
        </div>
    );
};

export default HomePage;
