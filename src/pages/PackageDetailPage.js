import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Card, Tab, Tabs, Image, Modal, Form } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaCheckCircle, FaArrowLeft, FaHotel, FaCar, FaUtensils, FaMap, FaImages, FaUserTie, FaHeart, FaRegHeart, FaCalendar, FaUsers } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';

import { getPackage, getAllGuides, createBooking, getBookingsByDate, verifyOfferCode, getSavedTrips, toggleSavedTrip } from '../services/firestoreService';

const PackageDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loadingUser, formatPrice } = useApp(); // Get user and formatPrice from AppContext
    const [activeTab, setActiveTab] = useState('overview');
    const [isSaved, setIsSaved] = useState(false);

    // Data from Firestore
    const [pkg, setPkg] = useState(null);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [availabilityChecked, setAvailabilityChecked] = useState(false);


    // Multi-step booking state
    const [bookingStep, setBookingStep] = useState(1); // 1: Details, 2: Guide & Hotel, 3: Review & Payment

    // Form states
    const [bookingData, setBookingData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        adults: 1,
        children: 0,
        specialRequests: ''
    });
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [checkDate, setCheckDate] = useState('');
    const [availableGuides, setAvailableGuides] = useState([]);
    const [guideAvailabilityError, setGuideAvailabilityError] = useState('');

    // Offer/Discount handling
    const [offerCode, setOfferCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const [discountSuccess, setDiscountSuccess] = useState('');

    // Pricing constants
    const CHILDREN_DISCOUNT = 0.5; // 50% discount for children

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch package
                const pkgData = await getPackage(id);
                setPkg(pkgData);

                // Fetch guides
                const guidesData = await getAllGuides();
                // Filter active guides
                const activeGuides = guidesData.filter(g => !g.status || g.status === 'active' || g.status === 'approved');
                setGuides(activeGuides);
            } catch (error) {
                console.error("Error loading data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Check if package is saved on mount
    useEffect(() => {
        const checkSavedStatus = async () => {
            if (user?.uid) {
                try {
                    const saved = await getSavedTrips(user.uid);
                    setIsSaved(saved.includes(id) || saved.includes(parseInt(id)));
                } catch (error) {
                    console.error("Error checking saved status", error);
                }
            } else {
                setIsSaved(false);
            }
        };
        checkSavedStatus();
    }, [id, user]);

    // Check guide availability for selected date
    const checkGuideAvailability = async (selectedDate) => {
        if (!selectedDate) {
            setAvailableGuides(guides);
            return;
        }

        try {
            // Get bookings for this date from Firestore
            const bookingsOnDate = await getBookingsByDate(selectedDate);

            // Find guides that are already booked on the selected date
            const bookedGuideIds = bookingsOnDate.map(booking => booking.guide?.id);

            // Filter out booked guides
            const available = guides.filter(guide => !bookedGuideIds.includes(guide.id));

            setAvailableGuides(available);

            // Set error message if no guides available
            if (available.length === 0) {
                setGuideAvailabilityError('Sorry, no guides are available for your selected dates. Please choose different dates or contact us.');
            } else {
                setGuideAvailabilityError('');
            }

            // Clear selected guide if they're not available on the new date
            if (selectedGuide && bookedGuideIds.includes(selectedGuide.id)) {
                setSelectedGuide(null);
            }
        } catch (error) {
            console.error("Error checking guide availability", error);
            // Fallback to all guides if error? Or assume unavailable?
            // Safer to show all but warn? Or show none?
            // Let's show all and log error.
            setAvailableGuides(guides);
        }
    };

    const calculateTotalPrice = () => {
        if (!pkg) return 0;
        const adultPrice = pkg.price * bookingData.adults;
        const childPrice = pkg.price * CHILDREN_DISCOUNT * bookingData.children;
        let total = adultPrice + childPrice;

        if (appliedDiscount) {
            const discountValue = appliedDiscount.discount; // e.g., "20%" or "LKR 5000"
            if (discountValue.includes('%')) {
                const percentage = parseFloat(discountValue) / 100;
                total -= total * percentage;
            } else {
                // Remove non-numeric chars except dot
                const amount = parseFloat(discountValue.replace(/[^0-9.]/g, ''));
                if (!isNaN(amount)) {
                    total -= amount;
                }
            }
        }
        return Math.max(0, total);
    };

    const handleApplyPromo = async () => {
        setDiscountError('');
        setDiscountSuccess('');
        setAppliedDiscount(null);

        if (!offerCode.trim()) return;

        try {
            const result = await verifyOfferCode(offerCode.trim());
            if (result.valid) {
                setAppliedDiscount(result.offer);
                setDiscountSuccess(`Offer Applied: ${result.offer.title} (${result.offer.discount})`);
            } else {
                setDiscountError(result.message);
            }
        } catch (error) {
            console.error("Promo check error", error);
            setDiscountError("Failed to verify code");
        }
    };

    // Handler functions
    const toggleSave = async () => {
        if (!user) {
            alert("Please login to save packages!");
            return;
        }

        try {
            const newSaved = await toggleSavedTrip(user.uid, id);
            setIsSaved(newSaved.includes(id) || newSaved.includes(parseInt(id)));
            window.dispatchEvent(new Event('local-storage-update'));
        } catch (error) {
            console.error("Error toggling save:", error);
        }
    };

    const handleBookNow = () => {
        setBookingStep(1);
        setShowBookingModal(true);
    };

    const handleNextStep = () => {
        if (bookingStep === 1) {
            // Validate step 1
            if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.date) {
                alert('Please fill in all required fields');
                return;
            }
            if (bookingData.adults < 1) {
                alert('At least 1 adult is required');
                return;
            }
            // Check guide availability for selected date
            checkGuideAvailability(bookingData.date);
            setBookingStep(2);
        } else if (bookingStep === 2) {
            // Validate step 2
            if (!selectedGuide) {
                alert('Please select a guide');
                return;
            }

            // Check if selected guide is available
            const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            const isGuideBooked = existingBookings.some(
                booking => booking.travelDate === bookingData.date && booking.guide.id === selectedGuide.id
            );

            if (isGuideBooked) {
                alert('This guide is not available on your selected dates. Please choose another guide.');
                setSelectedGuide(null);
                return;
            }

            if (!selectedHotel) {
                alert('Please select a hotel');
                return;
            }
            setBookingStep(3);
        } else if (bookingStep === 3) {
            // Validate payment
            if (!paymentMethod) {
                alert('Please select a payment method');
                return;
            }
            // Process payment and complete booking
            handleCompleteBooking();
        }
    };

    const handlePrevStep = () => {
        setBookingStep(bookingStep - 1);
    };

    const handleCompleteBooking = async () => {
        // Generate booking ID (simple prefix for display, but firestore has its own ID)
        const bookingDisplayId = 'BK' + Date.now().toString().slice(-6);
        const totalAmount = calculateTotalPrice();

        const newBooking = {
            userId: user ? user.uid : null, // Save user ID (from AppContext)
            bookingId: bookingDisplayId,
            packageId: pkg.id,
            packageTitle: pkg.title,
            packageImage: pkg.image,
            location: pkg.location,
            travelDate: bookingData.date,
            adults: parseInt(bookingData.adults),
            children: parseInt(bookingData.children),
            totalGuests: parseInt(bookingData.adults) + parseInt(bookingData.children),
            customerName: bookingData.name,
            customerEmail: bookingData.email,
            customerPhone: bookingData.phone,
            guide: selectedGuide,
            hotel: selectedHotel,
            specialRequests: bookingData.specialRequests,
            paymentMethod: paymentMethod,
            totalAmount: totalAmount,
            appliedOffer: appliedDiscount ? {
                code: appliedDiscount.code,
                discount: appliedDiscount.discount,
                title: appliedDiscount.title
            } : null,
            // status and paymentStatus set in service or default to pending
        };

        try {
            await createBooking(newBooking);

            // Show success
            alert(`✅ Payment Successful!\n\nBooking Confirmed!\nBooking Ref: ${bookingDisplayId}\n\nPackage: ${pkg.title}\nDate: ${bookingData.date}\nAdults: ${bookingData.adults} | Children: ${bookingData.children}\nGuide: ${selectedGuide.name}\nHotel: ${selectedHotel.name}\n\nTotal Paid: ${formatPrice(totalAmount)}\n\nYou will receive a confirmation email shortly.`);

            closeBookingModal();

            // Navigate to My Bookings
            if (user) {
                setTimeout(() => {
                    if (window.confirm('Would you like to view your booking details now?')) {
                        navigate('/my-bookings');
                    }
                }, 500);
            }
        } catch (error) {
            console.error("Error creating booking", error);
            alert("Booking failed. Please try again.");
        }
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
        setTimeout(() => {
            // Reset all states
            setBookingStep(1);
            setBookingData({
                name: '',
                email: '',
                phone: '',
                date: '',
                adults: 1,
                children: 0,
                specialRequests: ''
            });
            setSelectedGuide(null);
            setSelectedHotel(null);
            setPaymentMethod('');
            setOfferCode('');
            setAppliedDiscount(null);
            setDiscountError('');
            setDiscountSuccess('');
        }, 300);
    };

    const handleCheckAvailability = () => {
        setShowAvailabilityModal(true);
        setAvailabilityChecked(false);
    };

    const handleAvailabilityCheck = () => {
        if (!checkDate) {
            alert('Please select a date');
            return;
        }
        // Simulate availability check
        setAvailabilityChecked(true);
    };

    const handleBookFromAvailability = () => {
        setShowAvailabilityModal(false);
        setBookingData({ ...bookingData, date: checkDate });
        setShowBookingModal(true);
    };

    if (!pkg) {
        return (
            <div className="min-vh-100 d-flex flex-column">
                <AppNavbar user={user} />
                <Container className="py-5 text-center my-auto">
                    <h2>Package Not Found</h2>
                    <Button as={Link} to="/packages" variant="primary" className="mt-3">Back to Packages</Button>
                </Container>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light d-flex flex-column">
            <AppNavbar user={user} />

            {/* Hero Image Section */}
            <div className="position-relative" style={{ height: '50vh', minHeight: '400px' }}>
                <img src={pkg.image} alt={pkg.title} className="w-100 h-100 object-cover" style={{ objectFit: 'cover' }} />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
                <div className="position-absolute top-0 start-0 p-4">
                    <Button as={Link} to="/packages" variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center bg-white bg-opacity-75 text-dark" style={{ width: '40px', height: '40px' }}>
                        <FaArrowLeft />
                    </Button>
                </div>
                <div className="position-absolute bottom-0 start-0 w-100 p-5 text-white">
                    <Container>
                        <Badge bg="info" className="mb-2 bg-primary-custom fw-normal px-3 py-2 rounded-pill">{pkg.duration}</Badge>
                        <h1 className="display-4 fw-bold mb-2">{pkg.title}</h1>
                        <div className="d-flex align-items-center gap-3">
                            <span className="d-flex align-items-center"><FaMapMarkerAlt className="me-2 text-info" /> {pkg.location}</span>
                            <span className="text-warning d-flex align-items-center"><FaStar className="me-2" /> {pkg.rating} (120+ Reviews)</span>
                        </div>
                    </Container>
                </div>
            </div>

            <Container className="py-5">
                <Row>
                    <Col lg={8}>
                        {/* Navigation Tabs */}
                        <div className="mb-4">
                            <Tabs
                                id="package-details-tabs"
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="mb-3 border-bottom-0"
                                fill
                                variant="pills"
                            >
                                <Tab eventKey="overview" title={<span>Overview</span>} />
                                <Tab eventKey="hotels" title={<span><FaHotel className="me-1" /> Hotels</span>} />
                                <Tab eventKey="transport" title={<span><FaCar className="me-1" /> Transport</span>} />
                                <Tab eventKey="food" title={<span><FaUtensils className="me-1" /> Food</span>} />
                                <Tab eventKey="guides" title={<span><FaUserTie className="me-1" /> Guides</span>} />
                                <Tab eventKey="gallery" title={<span><FaImages className="me-1" /> Gallery</span>} />
                            </Tabs>
                        </div>

                        <div className="bg-white p-4 rounded-4 shadow-sm mb-4" style={{ minHeight: '300px' }}>
                            {activeTab === 'overview' && (
                                <div className="animate__animated animate__fadeIn">
                                    <h3 className="fw-bold mb-3">About this Trip</h3>
                                    <p className="text-secondary leading-relaxed mb-4">{pkg.description}</p>

                                    <h5 className="fw-bold mb-3">What's Included</h5>
                                    <Row>
                                        {pkg.included?.map((item, index) => (
                                            <Col md={6} key={index} className="mb-3">
                                                <div className="d-flex align-items-center p-2 rounded-3 bg-light">
                                                    <FaCheckCircle className="text-success me-2" />
                                                    <span className="text-dark fw-medium">{item}</span>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>

                                    <h5 className="fw-bold mb-3 mt-4"><FaMap className="me-2 text-primary-custom" />Location</h5>
                                    <div className="rounded-4 overflow-hidden shadow-sm">
                                        <iframe
                                            width="100%"
                                            height="300"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(pkg.mapLocation || pkg.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                            title="Package Location"
                                        ></iframe>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'hotels' && (
                                <div className="animate__animated animate__fadeIn">
                                    <h3 className="fw-bold mb-4">Accommodation Options</h3>
                                    {pkg.hotels?.map((hotel, idx) => (
                                        <div key={idx} className="d-flex mb-4 border rounded-3 p-3 align-items-center shadow-sm">
                                            <Image src={hotel.image} rounded style={{ width: '150px', height: '120px', objectFit: 'cover' }} className="me-3" />
                                            <div className="flex-grow-1">
                                                <h5 className="fw-bold mb-1">{hotel.name}</h5>
                                                <Badge bg="secondary" className="mb-2">{hotel.type}</Badge>
                                                <p className="text-secondary small mb-0">{hotel.description || 'Comfortable stay with modern amenities.'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'transport' && (
                                <div className="animate__animated animate__fadeIn">
                                    <h3 className="fw-bold mb-3">Transport Arrangements</h3>
                                    <div className="d-flex align-items-start p-4 bg-light rounded-3">
                                        <FaCar size={30} className="text-primary-custom me-3 mt-1" />
                                        <div>
                                            <h5 className="fw-bold">Private Transport</h5>
                                            <p className="text-secondary mb-0">{pkg.transport}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'food' && (
                                <div className="animate__animated animate__fadeIn">
                                    <h3 className="fw-bold mb-3">Dining & Meals</h3>
                                    <div className="d-flex align-items-start p-4 bg-light rounded-3">
                                        <FaUtensils size={30} className="text-warning me-3 mt-1" />
                                        <div>
                                            <h5 className="fw-bold">Meal Plan</h5>
                                            <p className="text-secondary mb-0">{pkg.food}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'guides' && (
                                <div className="animate__animated animate__fadeIn">
                                    <h3 className="fw-bold mb-4">Available Guides for this Trip</h3>
                                    <Row className="g-3">
                                        {guides.map(guide => (
                                            <Col xs={6} md={4} key={guide.id}>
                                                <div className="text-center p-3 border rounded-3 h-100 shadow-sm">
                                                    <Image src={guide.image} roundedCircle style={{ width: '80px', height: '80px', objectFit: 'cover' }} className="mb-2 border border-2 border-white shadow" />
                                                    <h6 className="fw-bold mb-0">{guide.name}</h6>
                                                    <small className="text-muted d-block">{guide.role}</small>
                                                    <small className="text-info">{guide.experience}</small>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {activeTab === 'gallery' && (
                                <div className="animate__animated animate__fadeIn">
                                    <h3 className="fw-bold mb-4">Trip Gallery</h3>
                                    <Row className="g-3">
                                        {pkg.gallery?.map((img, idx) => (
                                            <Col xs={6} md={4} key={idx}>
                                                <div className="overflow-hidden rounded-3 shadow-sm" style={{ height: '180px' }}>
                                                    <img
                                                        src={img}
                                                        alt={`Gallery ${idx + 1}`}
                                                        className="w-100 h-100 hover-zoom"
                                                        style={{
                                                            transition: 'transform 0.3s',
                                                            objectFit: 'cover',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    />
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}
                        </div>
                    </Col>

                    <Col lg={4}>
                        {/* Sticky Booking Card */}
                        <Card className="border-0 shadow-lg rounded-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-end mb-3">
                                    <div>
                                        <small className="text-secondary">Starting from</small>
                                        <h3 className="fw-bold text-primary-custom mb-0">{formatPrice(pkg.price)}</h3>
                                        <small className="text-muted">per person</small>
                                    </div>
                                </div>
                                <hr className="text-secondary opacity-25" />
                                <div className="d-grid gap-3">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="btn-primary-custom rounded-pill fw-bold shadow-sm"
                                        onClick={handleBookNow}
                                    >
                                        Book Now
                                    </Button>
                                    <Button
                                        variant={isSaved ? "danger" : "outline-dark"}
                                        className="rounded-pill fw-bold"
                                        onClick={toggleSave}
                                    >
                                        {isSaved ? <FaHeart className="me-1" /> : <FaRegHeart className="me-1" />}
                                        {isSaved ? "Saved" : "Save to Wishlist"}
                                    </Button>
                                    <Button
                                        variant="outline-success"
                                        className="rounded-pill fw-bold"
                                        onClick={handleCheckAvailability}
                                    >
                                        <FaCalendar className="me-1" /> Check Availability
                                    </Button>
                                </div>
                                <p className="text-center text-muted small mt-3 mb-0">No credit card required to reserve.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Premium Multi-Step Booking Modal */}
            <Modal show={showBookingModal} onHide={closeBookingModal} size="xl" centered className="booking-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold w-100">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h4 className="mb-1 fw-bold" style={{ color: '#0891b2' }}>Complete Your Booking</h4>
                                <small className="text-muted">{pkg.title}</small>
                            </div>
                        </div>
                        {/* Modern Progress Bar */}
                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center position-relative" style={{ marginBottom: '10px' }}>
                                <div className="position-absolute w-100" style={{ top: '15px', left: 0, height: '3px', backgroundColor: '#e5e7eb', zIndex: 0 }}></div>
                                <div className="position-absolute" style={{ top: '15px', left: 0, width: `${(bookingStep - 1) * 50}%`, height: '3px', backgroundColor: '#0891b2', zIndex: 0, transition: 'width 0.3s ease' }}></div>

                                {[1, 2, 3].map(step => (
                                    <div key={step} className="text-center position-relative" style={{ flex: 1, zIndex: 1 }}>
                                        <div
                                            className={`mx-auto rounded-circle d-flex align-items-center justify-content-center fw-bold transition-all`}
                                            style={{
                                                width: '35px',
                                                height: '35px',
                                                backgroundColor: bookingStep >= step ? '#0891b2' : '#e5e7eb',
                                                color: bookingStep >= step ? 'white' : '#9ca3af',
                                                fontSize: '14px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: bookingStep === step ? '0 0 0 4px rgba(8, 145, 178, 0.2)' : 'none'
                                            }}
                                        >
                                            {bookingStep > step ? '✓' : step}
                                        </div>
                                        <small className={`d-block mt-2 ${bookingStep >= step ? 'text-primary fw-bold' : 'text-muted'}`} style={{ fontSize: '11px' }}>
                                            {step === 1 ? 'Details' : step === 2 ? 'Select' : 'Payment'}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Step 1: Booking Details */}
                    {bookingStep === 1 && (
                        <Form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="fade-in">
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>
                                    <FaUserTie className="me-2" style={{ color: '#0891b2' }} />
                                    Traveler Information
                                </h5>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold small text-secondary mb-2">FULL NAME *</Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="text"
                                                    required
                                                    value={bookingData.name}
                                                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                                    placeholder="John Doe"
                                                    className="p-3 border-2"
                                                    style={{ borderRadius: '12px', fontSize: '15px' }}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold small text-secondary mb-2">EMAIL ADDRESS *</Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="email"
                                                    required
                                                    value={bookingData.email}
                                                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                                                    placeholder="john@example.com"
                                                    className="ps-4 py-3 border-2"
                                                    style={{ borderRadius: '12px', fontSize: '15px' }}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold small text-secondary mb-2">PHONE NUMBER *</Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="tel"
                                                    required
                                                    value={bookingData.phone}
                                                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                                    placeholder="+94 XX XXX XXXX"
                                                    className="ps-4 py-3 border-2"
                                                    style={{ borderRadius: '12px', fontSize: '15px' }}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold small text-secondary mb-2">TRAVEL DATE *</Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type="date"
                                                    required
                                                    value={bookingData.date}
                                                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="p-3 border-2"
                                                    style={{ borderRadius: '12px', fontSize: '15px' }}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            <div className="mb-4">
                                <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>
                                    <FaUsers className="me-2" style={{ color: '#0891b2' }} />
                                    Number of Travelers
                                </h5>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <div className="p-4 border-2 rounded-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderColor: '#bae6fd' }}>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <div className="fw-bold" style={{ color: '#0891b2', fontSize: '16px' }}>Adults</div>
                                                    <small className="text-muted">Age 18+</small>
                                                </div>
                                                <Badge bg="info" className="px-3 py-2" style={{ fontSize: '13px' }}>{pkg.price}</Badge>
                                            </div>
                                            <Form.Control
                                                type="number"
                                                required
                                                min="1"
                                                max="20"
                                                value={bookingData.adults}
                                                onChange={(e) => setBookingData({ ...bookingData, adults: parseInt(e.target.value) || 1 })}
                                                className="py-2 text-center fw-bold border-2"
                                                style={{ borderRadius: '10px', fontSize: '18px', borderColor: '#0891b2' }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <div className="p-4 border-2 rounded-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#bbf7d0' }}>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <div className="fw-bold" style={{ color: '#16a34a', fontSize: '16px' }}>Children</div>
                                                    <small className="text-muted">Under 18</small>
                                                </div>
                                                <Badge bg="success" className="px-3 py-2" style={{ fontSize: '13px' }}>50% OFF</Badge>
                                            </div>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={bookingData.children}
                                                onChange={(e) => setBookingData({ ...bookingData, children: parseInt(e.target.value) || 0 })}
                                                className="py-2 text-center fw-bold border-2"
                                                style={{ borderRadius: '10px', fontSize: '18px', borderColor: '#16a34a' }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold small text-secondary mb-2">SPECIAL REQUESTS (OPTIONAL)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={bookingData.specialRequests}
                                    onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                                    placeholder="Dietary requirements, accessibility needs, special occasions..."
                                    className="p-3 border-2"
                                    style={{ borderRadius: '12px', fontSize: '14px' }}
                                />
                            </Form.Group>

                            <div className="d-flex gap-3 mt-4">
                                <Button variant="outline-secondary" onClick={closeBookingModal} className="px-4 py-3 rounded-pill" style={{ flex: '0 0 120px' }}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="fw-bold px-5 py-3 rounded-pill shadow-sm"
                                    style={{ flex: 1, background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', border: 'none' }}
                                >
                                    Continue to Guide & Hotel Selection →
                                </Button>
                            </div>
                        </Form>
                    )}

                    {/* Step 2: Select Guide & Hotel */}
                    {bookingStep === 2 && (
                        <div className="fade-in">
                            <div className="mb-4">
                                <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>
                                    <FaUserTie className="me-2" style={{ color: '#0891b2' }} />
                                    Choose Your Expert Guide
                                </h5>
                                <p className="text-muted small mb-3">Select one of our experienced guides for your journey</p>

                                {/* Show error if no guides available */}
                                {guideAvailabilityError && (
                                    <div className="alert alert-warning d-flex align-items-center rounded-3 mb-3" style={{ backgroundColor: '#fef3c7', border: '2px solid #fde047' }}>
                                        <span className="me-2" style={{ fontSize: '20px' }}>⚠️</span>
                                        <div>
                                            <strong>No Guides Available</strong>
                                            <p className="mb-0 small">{guideAvailabilityError}</p>
                                        </div>
                                    </div>
                                )}

                                <Row className="g-3">
                                    {guides.slice(0, 3).map(guide => {
                                        const isAvailable = availableGuides.length === 0 || availableGuides.some(g => g.id === guide.id);
                                        return (
                                            <Col md={4} key={guide.id}>
                                                <Card
                                                    className={`border-0 rounded-4 h-100 guide-card ${selectedGuide?.id === guide.id ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                                                    onClick={() => isAvailable && setSelectedGuide(guide)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: selectedGuide?.id === guide.id ? '0 8px 24px rgba(8, 145, 178, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                                                        border: selectedGuide?.id === guide.id ? '3px solid #0891b2' : '3px solid transparent',
                                                        transform: selectedGuide?.id === guide.id ? 'translateY(-4px)' : 'none'
                                                    }}
                                                >
                                                    <Card.Body className="text-center p-4">
                                                        {selectedGuide?.id === guide.id && (
                                                            <div className="position-absolute top-0 end-0 m-2">
                                                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', background: '#0891b2', color: 'white' }}>
                                                                    <FaCheckCircle size={16} />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="position-relative d-inline-block mb-3">
                                                            <Image
                                                                src={guide.image}
                                                                roundedCircle
                                                                style={{
                                                                    width: '90px',
                                                                    height: '90px',
                                                                    objectFit: 'cover',
                                                                    border: '4px solid white',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                }}
                                                            />
                                                            <div className="position-absolute bottom-0 end-0 rounded-circle bg-success" style={{ width: '16px', height: '16px', border: '3px solid white' }}></div>
                                                        </div>
                                                        <h6 className="fw-bold mb-1" style={{ color: '#1f2937' }}>{guide.name}</h6>
                                                        <Badge bg="light" text="dark" className="mb-2 px-3 py-2">{guide.role}</Badge>
                                                        <div className="text-info small fw-semibold">
                                                            <FaStar className="me-1" />
                                                            {guide.experience} Experience
                                                        </div>
                                                        {!isAvailable && (
                                                            <Badge bg="danger" className="mt-2">Not Available</Badge>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>

                            <div className="mb-4">
                                <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>
                                    <FaHotel className="me-2" style={{ color: '#0891b2' }} />
                                    Select Your Accommodation
                                </h5>
                                <p className="text-muted small mb-3">Pick your preferred hotel for this tour</p>
                                <Row className="g-3">
                                    {pkg.hotels?.map((hotel, idx) => (
                                        <Col md={6} key={idx}>
                                            <Card
                                                className={`border-0 rounded-4 overflow-hidden hotel-card ${selectedHotel?.name === hotel.name ? 'selected' : ''}`}
                                                onClick={() => setSelectedHotel(hotel)}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: selectedHotel?.name === hotel.name ? '0 8px 24px rgba(8, 145, 178, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                                                    border: selectedHotel?.name === hotel.name ? '3px solid #0891b2' : '3px solid transparent',
                                                    transform: selectedHotel?.name === hotel.name ? 'translateY(-4px)' : 'none'
                                                }}
                                            >
                                                <div className="position-relative">
                                                    <Image
                                                        src={hotel.image}
                                                        style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                                                    />
                                                    {selectedHotel?.name === hotel.name && (
                                                        <div className="position-absolute top-0 end-0 m-3">
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px', background: '#0891b2', color: 'white' }}>
                                                                <FaCheckCircle size={18} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Badge
                                                        bg="dark"
                                                        className="position-absolute bottom-0 start-0 m-3 px-3 py-2"
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        {hotel.type}
                                                    </Badge>
                                                </div>
                                                <Card.Body className="p-4">
                                                    <h6 className="fw-bold mb-2" style={{ color: '#1f2937' }}>{hotel.name}</h6>
                                                    <p className="text-muted small mb-0" style={{ fontSize: '13px' }}>{hotel.description}</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>

                            <div className="d-flex gap-3 mt-4">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handlePrevStep}
                                    className="px-4 py-3 rounded-pill"
                                    style={{ flex: '0 0 120px' }}
                                >
                                    ← Back
                                </Button>
                                <Button
                                    className="fw-bold px-5 py-3 rounded-pill shadow-sm"
                                    onClick={handleNextStep}
                                    style={{ flex: 1, background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', border: 'none' }}
                                >
                                    Continue to Payment →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Payment */}
                    {bookingStep === 3 && (
                        <div className="fade-in">
                            {/* Promo Code Section */}
                            <div className="mb-4 p-4 rounded-4 bg-light border border-dashed border-secondary">
                                <h6 className="fw-bold mb-3">Have a Promo Code?</h6>
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        placeholder="Enter code here"
                                        value={offerCode}
                                        onChange={(e) => setOfferCode(e.target.value)}
                                        disabled={!!appliedDiscount}
                                    />
                                    {appliedDiscount ? (
                                        <Button variant="outline-danger" onClick={() => { setAppliedDiscount(null); setOfferCode(''); setDiscountSuccess(''); }}>
                                            Remove
                                        </Button>
                                    ) : (
                                        <Button variant="dark" onClick={handleApplyPromo}>Apply</Button>
                                    )}
                                </div>
                                {discountError && <small className="text-danger mt-2 d-block">{discountError}</small>}
                                {discountSuccess && <small className="text-success mt-2 d-block fw-bold">{discountSuccess}</small>}
                            </div>

                            <div className="mb-4 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
                                <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>
                                    Booking Summary
                                </h5>
                                <Row className="g-2 mb-3">
                                    <Col xs={6}><span className="text-muted small">Package</span></Col>
                                    <Col xs={6} className="text-end"><span className="fw-semibold">{pkg.title}</span></Col>
                                    <Col xs={6}><span className="text-muted small">Travel Date</span></Col>
                                    <Col xs={6} className="text-end"><span className="fw-semibold">{new Date(bookingData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></Col>
                                    <Col xs={6}><span className="text-muted small">Travelers</span></Col>
                                    <Col xs={6} className="text-end"><span className="fw-semibold">{bookingData.adults} Adults, {bookingData.children} Children</span></Col>
                                    <Col xs={6}><span className="text-muted small">Guide</span></Col>
                                    <Col xs={6} className="text-end"><span className="fw-semibold">{selectedGuide?.name}</span></Col>
                                    <Col xs={6}><span className="text-muted small">Hotel</span></Col>
                                    <Col xs={6} className="text-end"><span className="fw-semibold">{selectedHotel?.name}</span></Col>
                                </Row>

                                <div className="border-top border-2 pt-3 mt-3">
                                    <Row className="g-2 mb-2">
                                        <Col xs={7}><span className="text-muted">Adults ({bookingData.adults} × {formatPrice(pkg.price)})</span></Col>
                                        <Col xs={5} className="text-end"><span className="fw-semibold">{formatPrice(pkg.price * bookingData.adults)}</span></Col>
                                    </Row>
                                    {bookingData.children > 0 && (
                                        <Row className="g-2 mb-2">
                                            <Col xs={7}><span className="text-success">Children ({bookingData.children} × 50% off)</span></Col>
                                            <Col xs={5} className="text-end"><span className="fw-semibold text-success">{formatPrice(pkg.price * CHILDREN_DISCOUNT * bookingData.children)}</span></Col>
                                        </Row>
                                    )}
                                    {appliedDiscount && (
                                        <Row className="g-2 mb-2">
                                            <Col xs={7}><span className="text-danger">Discount ({appliedDiscount.discount})</span></Col>
                                            <Col xs={5} className="text-end"><span className="fw-semibold text-danger">
                                                - {formatPrice((pkg.price * bookingData.adults + pkg.price * CHILDREN_DISCOUNT * bookingData.children) - calculateTotalPrice())}
                                            </span></Col>
                                        </Row>
                                    )}
                                    <Row className="g-2 pt-2 border-top">
                                        <Col xs={7}><span className="fw-bold fs-5">Total Amount</span></Col>
                                        <Col xs={5} className="text-end"><span className="fw-bold fs-4" style={{ color: '#0891b2' }}>{formatPrice(calculateTotalPrice())}</span></Col>
                                    </Row>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>
                                    Payment Method
                                </h5>
                                <div className="d-grid gap-2">
                                    {[
                                        { method: 'Credit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
                                        { method: 'Debit Card', icon: '�', desc: 'All major banks' },
                                        { method: 'PayPal', icon: '�', desc: 'Fast & secure' },
                                        { method: 'Bank Transfer', icon: '💳', desc: 'Direct bank payment' }
                                    ].map(({ method, icon, desc }) => (
                                        <div
                                            key={method}
                                            className={`p-3 rounded-3 border-2 d-flex align-items-center ${paymentMethod === method ? 'border-primary' : 'border-light'}`}
                                            onClick={() => setPaymentMethod(method)}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                backgroundColor: paymentMethod === method ? '#f0f9ff' : 'white'
                                            }}
                                        >
                                            <Form.Check
                                                type="radio"
                                                name="paymentMethod"
                                                checked={paymentMethod === method}
                                                onChange={() => { }}
                                                className="me-3"
                                            />
                                            <div className="flex-grow-1">
                                                <div className="fw-semibold">{method}</div>
                                                <small className="text-muted">{desc}</small>
                                            </div>
                                            {paymentMethod === method && <FaCheckCircle className="text-primary" />}
                                        </div>
                                    ))}
                                </div>

                                {paymentMethod && (
                                    <div className="alert alert-info mt-3 d-flex align-items-center rounded-3" style={{ backgroundColor: '#f0f9ff', border: '2px solid #bae6fd' }}>
                                        <small><strong>Secure Payment:</strong> Your payment information is encrypted and secure.</small>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex gap-3 mt-4">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handlePrevStep}
                                    className="px-4 py-3 rounded-pill"
                                    style={{ flex: '0 0 120px' }}
                                >
                                    ← Back
                                </Button>
                                <Button
                                    className="fw-bold px-5 py-3 rounded-pill shadow-lg"
                                    onClick={handleNextStep}
                                    style={{
                                        flex: 1,
                                        background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                                        border: 'none',
                                        fontSize: '16px'
                                    }}
                                >
                                    Complete Payment • {formatPrice(calculateTotalPrice())}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>


            {/* Availability Modal */}
            <Modal show={showAvailabilityModal} onHide={() => setShowAvailabilityModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Check Availability</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Select Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={checkDate}
                            onChange={(e) => setCheckDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </Form.Group>

                    {!availabilityChecked ? (
                        <Button
                            variant="primary"
                            className="btn-primary-custom w-100 rounded-pill fw-bold"
                            onClick={handleAvailabilityCheck}
                        >
                            Check Availability
                        </Button>
                    ) : (
                        <div className="text-center">
                            <div className="alert alert-success mb-3">
                                <FaCheckCircle className="me-2" size={24} />
                                <strong>Great news!</strong> This package is available on {new Date(checkDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                            </div>
                            <h6 className="fw-bold mb-3">Available Guides for this date:</h6>
                            <div className="mb-3">
                                {guides.slice(0, 3).map(guide => (
                                    <div key={guide.id} className="d-flex align-items-center p-2 border rounded-3 mb-2">
                                        <Image src={guide.image} roundedCircle style={{ width: '40px', height: '40px' }} className="me-3" />
                                        <div className="text-start flex-grow-1">
                                            <div className="fw-bold small">{guide.name}</div>
                                            <small className="text-muted">{guide.role}</small>
                                        </div>
                                        <Badge bg="success">Available</Badge>
                                    </div>
                                ))}
                            </div>
                            <div className="d-grid gap-2">
                                <Button
                                    variant="primary"
                                    className="btn-primary-custom rounded-pill fw-bold"
                                    onClick={handleBookFromAvailability}
                                >
                                    Proceed to Book
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="rounded-pill"
                                    onClick={() => { setAvailabilityChecked(false); setCheckDate(''); }}
                                >
                                    Check Another Date
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            <Footer />
        </div>
    );
};

export default PackageDetailPage;

