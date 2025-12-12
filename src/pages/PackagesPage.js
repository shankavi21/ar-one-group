import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup } from 'react-bootstrap';
import { FaSearch, FaHeart, FaStar, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';

const PackagesPage = () => {
    const user = auth.currentUser;
    const [searchParams] = useSearchParams(); // Get params
    const [searchTerm, setSearchTerm] = useState('');
    const [savedPackageIds, setSavedPackageIds] = useState([]);

    useEffect(() => {
        const query = searchParams.get('search');
        if (query) {
            setSearchTerm(query);
        }

        // Load saved trips
        const loadSaved = () => {
            const saved = JSON.parse(localStorage.getItem('savedTrips') || '[]');
            setSavedPackageIds(saved);
        };
        loadSaved();

        const handleStorageChange = () => loadSaved();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage-update', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage-update', handleStorageChange);
        };
    }, [searchParams]);

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

    const packages = [
        { id: 1, title: 'Sigiriya Adventure', location: 'Sigiriya, Sri Lanka', price: 'LKR 45,000', duration: '3 Days', image: '/sigiriya.png', rating: 4.8 },
        { id: 2, title: 'Ella Hill Climb', location: 'Ella, Sri Lanka', price: 'LKR 35,000', duration: '2 Days', image: '/ella.png', rating: 4.9 },
        { id: 3, title: 'Coastal Bliss', location: 'Mirissa, Sri Lanka', price: 'LKR 60,000', duration: '4 Days', image: '/beach.png', rating: 4.7 },
        { id: 4, title: 'Cultural Triangle', location: 'Kandy, Sri Lanka', price: 'LKR 55,000', duration: '3 Days', image: '/kandy.jpg', rating: 4.6 },
        { id: 5, title: 'Wild Yala Safari', location: 'Yala, Sri Lanka', price: 'LKR 40,000', duration: '2 Days', image: '/yala.jpg', rating: 4.8 },
        { id: 6, title: 'Historic Galle Fort', location: 'Galle, Sri Lanka', price: 'LKR 30,000', duration: '1 Day', image: '/galle.jpg', rating: 4.9 },
        { id: 7, title: 'Knuckles Trek', location: 'Matale, Sri Lanka', price: 'LKR 50,000', duration: '3 Days', image: '/knuckles.jpg', rating: 4.7 },
        { id: 8, title: 'Jaffna Discovery', location: 'Jaffna, Sri Lanka', price: 'LKR 65,000', duration: '4 Days', image: '/jaffna.jpg', rating: 4.5 },
    ];

    const filteredPackages = packages.filter(pkg =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="fw-bold mb-3">All Tour Packages</h1>
                    <p className="text-secondary max-w-2xl mx-auto">
                        Explore our wide range of curated tour packages designed to give you the best experience of Sri Lanka.
                    </p>
                    <div className="mx-auto mt-4" style={{ maxWidth: '600px' }}>
                        <InputGroup>
                            <InputGroup.Text className="bg-white border-end-0">
                                <FaSearch className="text-secondary" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search packages by name or location..."
                                className="border-start-0 shadow-none border-end-0 py-3"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="primary" className="fw-bold px-4 btn-primary-custom">Search</Button>
                        </InputGroup>
                    </div>
                </div>

                <Row>
                    {filteredPackages.map(pkg => (
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
                                        <div className="text-dark fw-bold">{pkg.price}</div>
                                        <Button variant="outline-primary" size="sm" className="rounded-pill px-3 border-primary-custom text-primary-custom">View Details</Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                    {filteredPackages.length === 0 && (
                        <Col className="text-center py-5">
                            <div className="text-secondary mb-3">
                                <FaSearch size={40} className="opacity-25" />
                            </div>
                            <h4>No packages found</h4>
                            <p className="text-secondary">Try adjusting your search criteria.</p>
                        </Col>
                    )}
                </Row>
            </Container>
            <Footer />
        </div>
    );
};

export default PackagesPage;
