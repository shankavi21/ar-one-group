import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, Row, Col, InputGroup, Modal, ListGroup } from 'react-bootstrap';
import { FaPhone, FaWhatsapp, FaEnvelope, FaCheck, FaSearch, FaFilter, FaInfoCircle, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaHiking, FaBed, FaClock, FaCreditCard } from 'react-icons/fa';
import { getGuideBookings, updateBookingStatus, getPackage } from '../../services/firestoreService';

const GuideBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [guideId, setGuideId] = useState(null);

    // Details Modal State
    const [showDetails, setShowDetails] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [packageDetails, setPackageDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const storedGuideId = localStorage.getItem('guideId');
        if (storedGuideId) {
            setGuideId(storedGuideId);
            loadBookings(storedGuideId);
        }
    }, []);

    const loadBookings = async (gid) => {
        try {
            const data = await getGuideBookings(gid);
            setBookings(data);
            setFilteredBookings(data);
        } catch (error) {
            console.error("Failed to load bookings", error);
        }
    };

    useEffect(() => {
        let result = bookings;

        // Apply Status Filter
        if (filter !== 'All') {
            result = result.filter(b => b.status?.toLowerCase() === filter.toLowerCase());
        }

        // Apply Search
        if (searchTerm) {
            result = result.filter(b =>
                b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.packageTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredBookings(result);
    }, [filter, searchTerm, bookings]);

    const handleMarkAsCompleted = async (bookingId) => {
        if (window.confirm('Mark this tour as completed?')) {
            try {
                await updateBookingStatus(bookingId, 'Completed');
                alert('Booking updated successfully!');
                loadBookings(guideId);
                if (selectedBooking && selectedBooking.id === bookingId) {
                    setSelectedBooking(prev => ({ ...prev, status: 'Completed' }));
                }
            } catch (error) {
                console.error("Error updating booking", error);
            }
        }
    };

    const handleViewDetails = async (booking) => {
        setSelectedBooking(booking);
        setShowDetails(true);
        setLoadingDetails(true);
        try {
            if (booking.packageId) {
                const pkg = await getPackage(booking.packageId);
                setPackageDetails(pkg);
            }
        } catch (error) {
            console.error("Error fetching package details", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            confirmed: 'success',
            pending: 'warning',
            completed: 'info',
            cancelled: 'danger'
        };
        return <Badge bg={variants[status?.toLowerCase()] || 'secondary'}>{status?.toUpperCase()}</Badge>;
    };

    return (
        <div className="guide-bookings">
            <h2 className="fw-bold mb-4">My Assigned Bookings</h2>

            {/* Filters */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text className="bg-white border-end-0">
                                    <FaSearch className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    className="border-start-0 ps-0"
                                    placeholder="Search by customer name, package or booking ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex gap-2">
                                {['All', 'Confirmed', 'Pending', 'Completed'].map(f => (
                                    <Button
                                        key={f}
                                        variant={filter === f ? (f === 'All' ? 'dark' : f === 'Confirmed' ? 'success' : f === 'Pending' ? 'warning' : 'info') : `outline-${f === 'All' ? 'dark' : f === 'Confirmed' ? 'success' : f === 'Pending' ? 'warning' : 'info'}`}
                                        onClick={() => setFilter(f)}
                                        className="flex-fill"
                                    >{f}</Button>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Bookings Table */}
            <Card className="border-0 shadow-sm mt-4">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3">Booking ID</th>
                                    <th className="py-3">Customer</th>
                                    <th className="py-3">Package & Date</th>
                                    <th className="py-3">Guests</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3 text-end px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="align-middle">
                                        <td className="px-4 fw-bold text-primary">
                                            <Button variant="link" className="p-0 fw-bold" onClick={() => handleViewDetails(booking)}>
                                                {booking.bookingId}
                                            </Button>
                                        </td>
                                        <td>
                                            <div className="fw-medium">{booking.customerName}</div>
                                            <div className="small text-muted">{booking.customerEmail}</div>
                                            <div className="small text-muted">{booking.customerPhone}</div>
                                        </td>
                                        <td>
                                            <div className="fw-medium">{booking.packageTitle}</div>
                                            <div className="small text-muted">
                                                <FaCalendarAlt className="me-1" />
                                                {new Date(booking.travelDate).toDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="secondary" pill>
                                                {(parseInt(booking.adults || 0) + parseInt(booking.children || 0))} Guests
                                            </Badge>
                                            <div className="small text-muted mt-1">
                                                {booking.adults} Adults, {booking.children} Children
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(booking.status)}</td>
                                        <td className="text-end px-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    title="View Details"
                                                    onClick={() => handleViewDetails(booking)}
                                                >
                                                    <FaInfoCircle />
                                                </Button>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    title="Call Customer"
                                                    onClick={() => window.open(`tel:${booking.customerPhone}`)}
                                                >
                                                    <FaPhone />
                                                </Button>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    title="WhatsApp"
                                                    onClick={() => window.open(`https://wa.me/${booking.customerPhone?.replace(/[^0-9]/g, '')}`)}
                                                >
                                                    <FaWhatsapp />
                                                </Button>
                                                {booking.status?.toLowerCase() === 'confirmed' && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleMarkAsCompleted(booking.id)}
                                                    >
                                                        <FaCheck className="me-1" /> Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBookings.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <FaInfoCircle className="text-muted mb-2" size={24} />
                                            <p className="text-muted">No bookings found matching your criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Detailed Booking Modal */}
            <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fw-bold">
                        Booking Details: <span className="text-primary">{selectedBooking?.bookingId}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {selectedBooking && (
                        <div className="booking-modal-content">
                            <Row className="g-0">
                                <Col md={5} className="bg-light p-4 border-end">
                                    <h6 className="fw-bold mb-3 text-uppercase small text-muted">Customer Information</h6>
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="bg-white rounded-circle p-2 me-3 shadow-sm">
                                                <FaUser className="text-primary" />
                                            </div>
                                            <div>
                                                <div className="fw-bold">{selectedBooking.customerName}</div>
                                                <small className="text-muted">Lead Traveler</small>
                                            </div>
                                        </div>
                                        <div className="ps-5 small mb-1">
                                            <FaEnvelope className="me-2 text-muted" /> {selectedBooking.customerEmail}
                                        </div>
                                        <div className="ps-5 small">
                                            <FaPhone className="me-2 text-muted" /> {selectedBooking.customerPhone}
                                        </div>
                                    </div>

                                    <h6 className="fw-bold mb-3 text-uppercase small text-muted">Tour Statistics</h6>
                                    <ListGroup variant="flush" className="bg-transparent mb-4">
                                        <ListGroup.Item className="bg-transparent px-0 border-0 d-flex justify-content-between">
                                            <span>Adults:</span> <span className="fw-bold">{selectedBooking.adults}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-transparent px-0 border-0 d-flex justify-content-between">
                                            <span>Children:</span> <span className="fw-bold">{selectedBooking.children}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-transparent px-0 border-0 d-flex justify-content-between">
                                            <span>Travel Date:</span> <span className="fw-bold text-primary">{new Date(selectedBooking.travelDate).toLocaleDateString()}</span>
                                        </ListGroup.Item>
                                    </ListGroup>

                                    <h6 className="fw-bold mb-3 text-uppercase small text-muted">Accommodation</h6>
                                    <div className="p-3 bg-white rounded-3 shadow-sm mb-4 border-start border-4 border-info">
                                        <div className="fw-bold"><FaBed className="me-2 text-info" /> {selectedBooking.hotel?.name || 'Standard Hotel'}</div>
                                        <div className="small text-muted">{selectedBooking.hotel?.type || 'Not specified'}</div>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <Button variant="success" onClick={() => window.open(`https://wa.me/${selectedBooking.customerPhone?.replace(/[^0-9]/g, '')}`)}>
                                            <FaWhatsapp className="me-2" /> Message on WhatsApp
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={7} className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div>
                                            <h4 className="fw-bold mb-0">{selectedBooking.packageTitle}</h4>
                                            <div className="text-muted"><FaMapMarkerAlt className="me-1" /> {selectedBooking.location || 'Sri Lanka'}</div>
                                        </div>
                                        {getStatusBadge(selectedBooking.status)}
                                    </div>

                                    {loadingDetails ? (
                                        <div className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                            <p className="mt-2 text-muted">Loading package details...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {packageDetails ? (
                                                <div className="package-info mb-4">
                                                    <div className="d-flex gap-3 mb-4">
                                                        <div className="flex-fill p-2 bg-light rounded text-center">
                                                            <FaClock className="text-primary mb-1" />
                                                            <div className="small fw-bold">{packageDetails.duration}</div>
                                                        </div>
                                                        <div className="flex-fill p-2 bg-light rounded text-center">
                                                            <FaHiking className="text-primary mb-1" />
                                                            <div className="small fw-bold">Tour Guide</div>
                                                        </div>
                                                        <div className="flex-fill p-2 bg-light rounded text-center">
                                                            <FaCreditCard className="text-primary mb-1" />
                                                            <div className="small fw-bold">{selectedBooking.paymentMethod || 'Paid'}</div>
                                                        </div>
                                                    </div>

                                                    <h6 className="fw-bold mb-2">Description</h6>
                                                    <p className="small text-muted mb-4">{packageDetails.description}</p>

                                                    <h6 className="fw-bold mb-2">Daily Itinerary</h6>
                                                    <div className="itinerary-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                        {packageDetails.itinerary?.map((day, idx) => (
                                                            <div key={idx} className="mb-3 d-flex">
                                                                <div className="me-3 fw-bold text-primary">D{idx + 1}</div>
                                                                <div>
                                                                    <div className="fw-bold small">{day.title}</div>
                                                                    <div className="small text-muted">{day.description}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="alert alert-info small">
                                                    Package description and itinerary are not available for this legacy booking.
                                                </div>
                                            )}

                                            {selectedBooking.specialRequests && (
                                                <div className="mt-4 p-3 bg-warning bg-opacity-10 rounded border border-warning border-opacity-25">
                                                    <h6 className="fw-bold mb-1 small text-warning text-dark"><FaInfoCircle className="me-1" /> Special Requests</h6>
                                                    <p className="small mb-0">{selectedBooking.specialRequests}</p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <hr className="my-4" />

                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="small text-muted">Total Paid</div>
                                            <h4 className="fw-bold text-success mb-0">LKR {selectedBooking.totalAmount?.toLocaleString()}</h4>
                                        </div>
                                        {selectedBooking.status?.toLowerCase() === 'confirmed' && (
                                            <Button variant="success" className="px-4" onClick={() => handleMarkAsCompleted(selectedBooking.id)}>
                                                Mark as Completed
                                            </Button>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default GuideBookings;
