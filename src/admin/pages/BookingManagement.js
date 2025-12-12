import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge, InputGroup, Row, Col } from 'react-bootstrap';
import { FaSearch, FaEye, FaCheckCircle, FaTimes, FaCalendar } from 'react-icons/fa';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        loadBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [searchTerm, filterStatus, bookings]);

    const loadBookings = () => {
        const savedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        setBookings(savedBookings);
    };

    const filterBookings = () => {
        let filtered = bookings;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(booking =>
                booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.packageTitle?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(booking => booking.status === filterStatus);
        }

        setFilteredBookings(filtered);
    };

    const handleStatusUpdate = (bookingId, newStatus) => {
        const updatedBookings = bookings.map(booking =>
            booking.bookingId === bookingId ? { ...booking, status: newStatus } : booking
        );
        setBookings(updatedBookings);
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        alert(`Booking status updated to ${newStatus}!`);
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    const getStatusBadge = (status) => {
        const variants = {
            confirmed: 'success',
            pending: 'warning',
            completed: 'info',
            cancelled: 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'} className="px-2 py-1">{status?.toUpperCase()}</Badge>;
    };

    const calculateStats = () => {
        const total = bookings.length;
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;
        const pending = bookings.filter(b => b.status === 'pending').length;
        const completed = bookings.filter(b => b.status === 'completed').length;
        const revenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        return { total, confirmed, pending, completed, revenue };
    };

    const stats = calculateStats();

    return (
        <div>
            <h2 className="fw-bold mb-4">Booking Management</h2>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 small">Total Bookings</p>
                            <h3 className="fw-bold mb-0">{stats.total}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 small">Confirmed</p>
                            <h3 className="fw-bold mb-0 text-success">{stats.confirmed}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 small">Pending</p>
                            <h3 className="fw-bold mb-0 text-warning">{stats.pending}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 small">Total Revenue</p>
                            <h3 className="fw-bold mb-0 text-primary">LKR {stats.revenue.toLocaleString()}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Search and Filters */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by booking ID, customer name, email, or package..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Bookings Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Customer</th>
                                    <th>Package</th>
                                    <th>Travel Date</th>
                                    <th>Guests</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map(booking => (
                                        <tr key={booking.bookingId}>
                                            <td className="fw-medium">{booking.bookingId}</td>
                                            <td>
                                                <div>{booking.customerName}</div>
                                                <small className="text-muted">{booking.customerEmail}</small>
                                            </td>
                                            <td>{booking.packageTitle}</td>
                                            <td>
                                                <FaCalendar className="me-1 text-primary" />
                                                {new Date(booking.travelDate).toLocaleDateString()}
                                            </td>
                                            <td>{booking.adults + booking.children} ({booking.adults}A + {booking.children}C)</td>
                                            <td className="fw-bold text-success">LKR {booking.totalAmount?.toLocaleString()}</td>
                                            <td>{getStatusBadge(booking.status)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleViewDetails(booking)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                {booking.status === 'pending' && (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleStatusUpdate(booking.bookingId, 'confirmed')}
                                                    >
                                                        <FaCheckCircle />
                                                    </Button>
                                                )}
                                                {booking.status !== 'cancelled' && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(booking.bookingId, 'cancelled')}
                                                    >
                                                        <FaTimes />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">
                                            No bookings found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Booking Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Booking Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <div>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Booking ID:</strong> {selectedBooking.bookingId}</p>
                                    <p><strong>Customer:</strong> {selectedBooking.customerName}</p>
                                    <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                                    <p><strong>Phone:</strong> {selectedBooking.customerPhone}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Package:</strong> {selectedBooking.packageTitle}</p>
                                    <p><strong>Travel Date:</strong> {new Date(selectedBooking.travelDate).toLocaleDateString()}</p>
                                    <p><strong>Guests:</strong> {selectedBooking.adults} Adults + {selectedBooking.children} Children</p>
                                    <p><strong>Total Amount:</strong> <span className="text-success fw-bold">LKR {selectedBooking.totalAmount?.toLocaleString()}</span></p>
                                </Col>
                            </Row>
                            <hr />
                            <Row>
                                <Col md={6}>
                                    <p><strong>Guide:</strong> {selectedBooking.guide?.name} ({selectedBooking.guide?.role})</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Hotel:</strong> {selectedBooking.hotel?.name} ({selectedBooking.hotel?.type})</p>
                                </Col>
                            </Row>
                            {selectedBooking.specialRequests && (
                                <>
                                    <hr />
                                    <p><strong>Special Requests:</strong></p>
                                    <p className="text-muted">{selectedBooking.specialRequests}</p>
                                </>
                            )}
                            <hr />
                            <p><strong>Payment Method:</strong> {selectedBooking.paymentMethod}</p>
                            <p><strong>Payment Status:</strong> <Badge bg="success">{selectedBooking.paymentStatus}</Badge></p>
                            <p><strong>Status:</strong> {getStatusBadge(selectedBooking.status)}</p>
                            <p className="text-muted small">Booked on: {new Date(selectedBooking.bookingDate).toLocaleString()}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BookingManagement;
