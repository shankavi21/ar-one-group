import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaClock, FaMoneyBill, FaUserTie, FaHotel } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';

import { getUserBookings } from '../services/firestoreService';
import { generateBookingPDF } from '../utils/pdfGenerator';

const MyBookingsPage = () => {
    const { user, loadingUser, formatPrice } = useApp(); // Get user and formatPrice from AppContext
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (loadingUser) return; // Wait for user to be loaded

            if (user) {
                try {
                    const data = await getUserBookings(user.uid);
                    setBookings(data);
                } catch (error) {
                    console.error("Error loading bookings", error);
                }
            } else {
                setBookings([]);
            }
        };
        fetchBookings();
    }, [user, loadingUser]);

    const getStatusBadge = (status) => {
        const variants = {
            confirmed: 'success',
            pending: 'warning',
            completed: 'info',
            cancelled: 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'} className="px-2 py-1">{status.toUpperCase()}</Badge>;
    };

    if (bookings.length === 0) {
        return (
            <div className="min-vh-100 bg-light d-flex flex-column">
                <AppNavbar user={user} />
                <Container className="py-5 mt-5">
                    <div className="text-center py-5">
                        <FaCalendar size={60} className="text-muted mb-3 opacity-25" />
                        <h3>No Bookings Yet</h3>
                        <p className="text-secondary">Start exploring our packages and make your first booking!</p>
                        <Button href="/packages" variant="primary" className="mt-3 rounded-pill px-4 fw-bold btn-primary-custom">
                            Browse Packages
                        </Button>
                    </div>
                </Container>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light d-flex flex-column">
            <AppNavbar user={user} />
            <Container className="py-5 mt-5">
                <div className="mb-4">
                    <h1 className="fw-bold mb-2">My Bookings</h1>
                    <p className="text-secondary">Manage and track all your tour bookings</p>
                </div>

                <Row>
                    {bookings.map((booking) => (
                        <Col md={12} key={booking.bookingId} className="mb-4">
                            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                <Card.Body className="p-4">
                                    <Row>
                                        <Col md={3}>
                                            <img
                                                src={booking.packageImage}
                                                alt={booking.packageTitle}
                                                className="w-100 rounded-3"
                                                style={{ height: '150px', objectFit: 'cover' }}
                                            />
                                        </Col>
                                        <Col md={9}>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h5 className="fw-bold mb-1">{booking.packageTitle}</h5>
                                                    <small className="text-muted">
                                                        <FaMapMarkerAlt className="me-1" />{booking.location}
                                                    </small>
                                                </div>
                                                {getStatusBadge(booking.status)}
                                            </div>

                                            <Row className="mt-3">
                                                <Col md={3}>
                                                    <small className="text-muted d-block">Booking ID</small>
                                                    <strong className="d-block">{booking.bookingId}</strong>
                                                </Col>
                                                <Col md={3}>
                                                    <small className="text-muted d-block">Travel Date</small>
                                                    <strong className="d-block">
                                                        <FaCalendar className="me-1 text-primary-custom" />
                                                        {new Date(booking.travelDate).toLocaleDateString()}
                                                    </strong>
                                                </Col>
                                                <Col md={3}>
                                                    <small className="text-muted d-block">Guests</small>
                                                    <strong className="d-block">
                                                        <FaUsers className="me-1 text-primary-custom" />
                                                        {booking.adults} Adults {booking.children > 0 && `+ ${booking.children} Children`}
                                                    </strong>
                                                </Col>
                                                <Col md={3}>
                                                    <small className="text-muted d-block">Total Paid</small>
                                                    <strong className="d-block text-success">
                                                        <FaMoneyBill className="me-1" />
                                                        {formatPrice(booking.totalAmount)}
                                                    </strong>
                                                </Col>
                                            </Row>

                                            <Row className="mt-3">
                                                <Col md={6}>
                                                    <small className="text-muted d-block">Assigned Guide</small>
                                                    <div className="d-flex align-items-center mt-1">
                                                        <img
                                                            src={booking.guide.image}
                                                            alt={booking.guide.name}
                                                            className="rounded-circle me-2"
                                                            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                                        />
                                                        <strong>{booking.guide.name}</strong>
                                                        <small className="text-muted ms-2">({booking.guide.role})</small>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <small className="text-muted d-block">Hotel</small>
                                                    <div className="d-flex align-items-center mt-1">
                                                        <FaHotel className="me-2 text-primary-custom" />
                                                        <strong>{booking.hotel.name}</strong>
                                                        <Badge bg="secondary" className="ms-2">{booking.hotel.type}</Badge>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <div className="mt-3 d-flex gap-2">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="rounded-pill"
                                                    onClick={() => window.location.href = `/packages/${booking.packageId}`}
                                                >
                                                    View Package
                                                </Button>

                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="rounded-pill"
                                                    onClick={() => generateBookingPDF(booking, formatPrice)}
                                                >
                                                    Download Invoice
                                                </Button>

                                                {booking.status === 'pending' && (
                                                    <Button variant="warning" size="sm" className="rounded-pill">
                                                        Complete Payment
                                                    </Button>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                                <Card.Footer className="bg-light border-0 p-3">
                                    <small className="text-muted">
                                        <FaClock className="me-1" />
                                        Booked on {booking.createdAt ? new Date(booking.createdAt.seconds ? booking.createdAt.toDate() : booking.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </small>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
            <Footer />
        </div>
    );
};

export default MyBookingsPage;
