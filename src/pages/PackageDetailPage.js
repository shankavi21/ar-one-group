import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Card, Tab, Tabs, Image, Modal, Form } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaCheckCircle, FaArrowLeft, FaHotel, FaCar, FaUtensils, FaMap, FaImages, FaUserTie, FaHeart, FaRegHeart, FaCalendar, FaUsers } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';

const PackageDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = auth.currentUser;
    const { formatPrice } = useApp(); // Get formatPrice for currency conversion
    const [activeTab, setActiveTab] = useState('overview');
    const [isSaved, setIsSaved] = useState(false);

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

    // Pricing constants
    const CHILDREN_DISCOUNT = 0.5; // 50% discount for children

    // Comprehensive Mock Data for All Packages
    const packages = [
        {
            id: 1,
            title: 'Sigiriya Adventure',
            location: 'Sigiriya, Sri Lanka',
            price: 45000,
            duration: '3 Days',
            image: '/sigiriya.png',
            rating: 4.8,
            description: 'Climb the ancient rock fortress of Sigiriya, a UNESCO World Heritage site. Explore the water gardens, frescoes, and the mirror wall. This package also includes a village tour and authentic Sri Lankan lunch.',
            included: ['Transport', 'Hotel Stay', 'Breakfast & Dinner', 'Entrance Fees', 'English Speaking Guide'],
            hotels: [
                { name: 'Heritance Kandalama', type: 'Luxury 5-Star', image: '/hotel_sigiriya1.jpg', description: 'Award-winning eco hotel designed by Geoffrey Bawa' },
                { name: 'Aliya Resort and Spa', type: '4 Star Resort', image: '/hotel_sigiriya2.jpg', description: 'Contemporary hotel with stunning rock fortress views' }
            ],
            transport: 'Comfortable air-conditioned private vehicle (Car/Van) with an experienced driver-guide throughout the tour.',
            food: 'Includes daily breakfast at the hotel. One authentic village lunch (rice and curry) experience with a local family is included.',
            mapLocation: 'Sigiriya, Sri Lanka',
            gallery: [
                '/sigiriya.png',
                '/sigiriya_gallery.jpg',
                '/sigiriya_gallery2.jpg',
                '/hotel_sigiriya1.jpg',
                '/hotel_sigiriya2.jpg',
                '/yala.jpg'
            ]
        },
        {
            id: 2,
            title: 'Ella Hill Climb',
            location: 'Ella, Sri Lanka',
            price: 35000,
            duration: '2 Days',
            image: '/ella.png',
            rating: 4.9,
            description: 'Experience the cool climate and stunning views of Ella. Hike up to Little Adam\'s Peak and visit the famous Nine Arches Bridge. Perfect for nature lovers and photographers.',
            included: ['Train Tickets', 'Homestay', 'Breakfast', 'Guided Hike'],
            hotels: [
                { name: '98 Acres Resort', type: 'Luxury Boutique', image: '/hotel_ella1.jpg', description: 'Nestled in a tea plantation with panoramic valley views' },
                { name: 'Ella Flower Garden', type: '3 Star Guesthouse', image: '/hotel_ella2.jpg', description: 'Cozy mountain retreat with authentic Sri Lankan hospitality' }
            ],
            transport: 'Scenic train journey from Kandy to Ella (observation class). Local transport in Tuk-Tuk included for sightseeing.',
            food: 'Daily breakfast with mountain views. Traditional Sri Lankan dinner at a local cafe with live music.',
            mapLocation: 'Ella, Sri Lanka',
            gallery: [
                '/ella.png',
                '/ella_gallery.jpg',
                '/ella_gallery2.jpg',
                '/hotel_ella1.jpg',
                '/hotel_ella2.jpg',
                '/knuckles.jpg'
            ]
        },
        {
            id: 3,
            title: 'Coastal Bliss',
            location: 'Mirissa, Sri Lanka',
            price: 60000,
            duration: '4 Days',
            image: '/beach.png',
            rating: 4.7,
            description: 'Relax on the sandy beaches of Mirissa. Go whale watching, surf the waves, or just soak up the sun. Includes a mesmerizing sunset boat ride.',
            included: ['Beachfront Hotel', 'Whale Watching', 'Breakfast', 'Airport Transfer'],
            hotels: [
                { name: 'Mandara Resort', type: 'Luxury Beach Resort', image: '/hotel_mirissa1.jpg', description: 'Exclusive beachfront property with infinity pool' },
                { name: 'Paradise Beach Club', type: '3 Star Beach Hotel', image: '/hotel_mirissa2.jpg', description: 'Direct beach access with stunning ocean views' }
            ],
            transport: 'Private coastal drive in a luxury sedan with experienced chauffeur.',
            food: 'Seafood BBQ dinner on the beach included. Fresh tropical breakfast daily.',
            mapLocation: 'Mirissa, Sri Lanka',
            gallery: [
                '/beach.png',
                '/mirissa_gallery.jpg',
                '/mirissa_gallery2.jpg',
                '/hotel_mirissa1.jpg',
                '/hotel_mirissa2.jpg',
                '/galle.jpg'
            ]
        },
        {
            id: 4,
            title: 'Cultural Triangle',
            location: 'Kandy, Sri Lanka',
            price: 55000,
            duration: '3 Days',
            image: '/kandy.jpg',
            rating: 4.6,
            description: 'Immerse yourself in the rich history of Kandy. Visit the Temple of the Tooth Relic, Royal Botanical Gardens, and witness a traditional cultural dance show.',
            included: ['Hotel Stay', 'All Entry Fees', 'Cultural Show Tickets', 'Private Transport'],
            hotels: [
                { name: 'Queens Hotel', type: 'Heritage Hotel', image: '/hotel_kandy1.jpg', description: 'Colonial-era property in the heart of Kandy' },
                { name: 'Grand Hotel', type: '4 Star', image: '/hotel_kandy2.jpg', description: 'Historic hotel with views of Kandy Lake' }
            ],
            transport: 'Air-conditioned van with professional driver for the entire group.',
            food: 'Buffet breakfast daily and one traditional Kandyan dinner with cultural performance.',
            mapLocation: 'Kandy, Sri Lanka',
            gallery: [
                '/kandy.jpg',
                '/kandy_gallery.jpg',
                '/kandy_gallery2.jpg',
                '/hotel_kandy1.jpg',
                '/hotel_kandy2.jpg',
                '/sigiriya.png'
            ]
        },
        {
            id: 5,
            title: 'Wild Yala Safari',
            location: 'Yala, Sri Lanka',
            price: 40000,
            duration: '2 Days',
            image: '/yala.jpg',
            rating: 4.8,
            description: 'Spot leopards, elephants, and exotic birds in the wild. Experience two thrilling game drives in Yala National Park, known for having the highest density of leopards in the world.',
            included: ['Camping/Lodge', 'Safari Jeep', 'BBQ Dinner', 'Park Fees', 'Professional Guide'],
            hotels: [
                { name: 'Yala Safari Camp', type: 'Luxury Tented Camp', image: '/hotel_yala1.jpg', description: 'Glamping experience in the wilderness' },
                { name: 'Cinnamon Wild', type: 'Safari Lodge', image: '/hotel_yala2.jpg', description: 'Eco-lodge on the edge of the national park' }
            ],
            transport: 'Private 4x4 Safari Jeep with expert naturalist guide.',
            food: 'Traditional BBQ dinner under the stars. Full board included with local and international cuisine.',
            mapLocation: 'Yala National Park, Sri Lanka',
            gallery: [
                '/yala.jpg',
                '/hotel_yala1.jpg',
                '/hotel_yala2.jpg',
                '/beach.png',
                '/galle.jpg',
                '/mirissa_gallery.jpg'
            ]
        },
        {
            id: 6,
            title: 'Historic Galle Fort',
            location: 'Galle, Sri Lanka',
            price: 30000,
            duration: '1 Day',
            image: '/galle.jpg',
            rating: 4.9,
            description: 'Explore the magnificent Dutch Fort in Galle, a UNESCO World Heritage Site. Walk through cobblestone streets, visit museums, boutique shops, and enjoy the iconic lighthouse views.',
            included: ['Transport', 'Guide', 'Entry Fees', 'Lunch'],
            hotels: [
                { name: 'Jetwing Lighthouse', type: 'Luxury Heritage', image: '/hotel_galle1.jpg', description: 'Iconic clifftop hotel designed by Geoffrey Bawa' },
                { name: 'Galle Fort Hotel', type: '4 Star Boutique', image: '/hotel_galle2.jpg', description: 'Restored mansion within the historic fort' }
            ],
            transport: 'Private air-conditioned vehicle with driver-guide.',
            food: 'Authentic Sri Lankan lunch at a colonial-era restaurant within the fort.',
            mapLocation: 'Galle Fort, Sri Lanka',
            gallery: [
                '/galle.jpg',
                '/hotel_galle1.jpg',
                '/hotel_galle2.jpg',
                '/beach.png',
                '/mirissa_gallery2.jpg',
                '/yala.jpg'
            ]
        },
        {
            id: 7,
            title: 'Knuckles Trek',
            location: 'Matale, Sri Lanka',
            price: 50000,
            duration: '3 Days',
            image: '/knuckles.jpg',
            rating: 4.7,
            description: 'Embark on an adventurous trek through the Knuckles Mountain Range, a biodiversity hotspot. Experience remote villages, misty peaks, and pristine waterfalls.',
            included: ['Trekking Guide', 'Camping Equipment', 'All Meals', 'Transport', 'Permits'],
            hotels: [
                { name: 'Knuckles Mountain Resort', type: 'Eco Lodge', image: '/hotel_knuckles1.jpg', description: 'Sustainable retreat with mountain views' },
                { name: 'The Rangala House', type: 'Boutique Villa', image: '/hotel_knuckles2.jpg', description: 'Charming property at the base of the range' }
            ],
            transport: '4WD vehicle for mountain terrain with experienced driver.',
            food: 'Full board included with packed lunches on trek days. Traditional Sri Lankan meals.',
            mapLocation: 'Knuckles Mountain Range, Sri Lanka',
            gallery: [
                '/knuckles.jpg',
                '/hotel_knuckles1.jpg',
                '/hotel_knuckles2.jpg',
                '/ella.png',
                '/ella_gallery.jpg',
                '/kandy_gallery2.jpg'
            ]
        },
        {
            id: 8,
            title: 'Jaffna Discovery',
            location: 'Jaffna, Sri Lanka',
            price: 65000,
            duration: '4 Days',
            image: '/jaffna.jpg',
            rating: 4.5,
            description: 'Discover the unique culture of Northern Sri Lanka. Visit the iconic Nallur Temple, Jaffna Fort, and experience the vibrant Tamil heritage, cuisine, and hospitality.',
            included: ['Flights/Transport', 'Hotel', 'All Meals', 'Cultural Guide', 'Entry Fees'],
            hotels: [
                { name: 'Jetwing Jaffna', type: '4 Star Hotel', image: '/hotel_jaffna1.jpg', description: 'Contemporary hotel in the heart of Jaffna' },
                { name: 'Tilko Jaffna City Hotel', type: '3 Star', image: '/hotel_jaffna2.jpg', description: 'Comfortable accommodation with local charm' }
            ],
            transport: 'Domestic flight to Jaffna. Private vehicle with cultural guide throughout.',
            food: 'Full board with authentic Jaffna Tamil cuisine. Special cooking demonstration included.',
            mapLocation: 'Jaffna, Sri Lanka',
            gallery: [
                '/jaffna.jpg',
                '/jaffna_gallery1.jpg',
                '/hotel_jaffna1.jpg',
                '/hotel_jaffna2.jpg',
                '/kandy.jpg',
                '/sigiriya.png'
            ]
        },
    ];

    const guides = [
        { id: 1, name: 'Saman Perera', role: 'Cultural Expert', image: 'https://randomuser.me/api/portraits/men/32.jpg', experience: '15 years' },
        { id: 2, name: 'Nimali Silva', role: 'Naturalist', image: 'https://randomuser.me/api/portraits/women/44.jpg', experience: '10 years' },
        { id: 3, name: 'Kumar Sangakkara', role: 'Adventure Lead', image: 'https://randomuser.me/api/portraits/men/22.jpg', experience: '12 years' },
        { id: 4, name: 'Dinesh Chandimal', role: 'Historian', image: 'https://randomuser.me/api/portraits/men/15.jpg', experience: '20 years' },
        { id: 5, name: 'Chathurika Fernando', role: 'Eco Guide', image: 'https://randomuser.me/api/portraits/women/65.jpg', experience: '8 years' },
    ];

    const pkg = packages.find(p => p.id === parseInt(id));

    // Check if package is saved on mount
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        setIsSaved(saved.includes(parseInt(id)));
    }, [id]);

    // Calculate total price dynamically (returns price in LKR)
    const calculateTotalPrice = () => {
        if (!selectedHotel) return 0;

        const basePrice = pkg.price; // Already a number in LKR
        const adultPrice = basePrice * bookingData.adults;
        const childPrice = basePrice * CHILDREN_DISCOUNT * bookingData.children;
        return adultPrice + childPrice;
    };

    // Check guide availability for selected date
    const checkGuideAvailability = (selectedDate) => {
        if (!selectedDate) {
            setAvailableGuides(guides);
            return;
        }

        // Get all existing bookings from localStorage
        const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');

        // Find guides that are already booked on the selected date
        const bookedGuideIds = existingBookings
            .filter(booking => booking.travelDate === selectedDate)
            .map(booking => booking.guide.id);

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
    };

    // Handler functions
    const toggleSave = () => {
        let saved = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        const packageId = parseInt(id);

        if (saved.includes(packageId)) {
            saved = saved.filter(pid => pid !== packageId);
            setIsSaved(false);
        } else {
            saved.push(packageId);
            setIsSaved(true);
        }

        localStorage.setItem('savedTrips', JSON.stringify(saved));
        window.dispatchEvent(new Event('local-storage-update'));
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

    const handleCompleteBooking = () => {
        // Generate booking ID
        const bookingId = 'BK' + Date.now().toString().slice(-8);
        const totalAmount = calculateTotalPrice();

        const newBooking = {
            bookingId: bookingId,
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
            status: 'confirmed',
            bookingDate: new Date().toISOString(),
            paymentStatus: 'paid'
        };

        // Save to localStorage
        const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        existingBookings.push(newBooking);
        localStorage.setItem('userBookings', JSON.stringify(existingBookings));

        // Show success
        alert(`✅ Payment Successful!\n\nBooking Confirmed!\nBooking ID: ${bookingId}\n\nPackage: ${pkg.title}\nDate: ${bookingData.date}\nAdults: ${bookingData.adults} | Children: ${bookingData.children}\nGuide: ${selectedGuide.name}\nHotel: ${selectedHotel.name}\n\nTotal Paid: ${formatPrice(totalAmount)}\n\nYou will receive a confirmation email shortly.`);

        closeBookingModal();

        // Navigate to My Bookings
        setTimeout(() => {
            if (window.confirm('Would you like to view your booking details now?')) {
                navigate('/my-bookings');
            }
        }, 500);
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

