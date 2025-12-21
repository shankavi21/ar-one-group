import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaClipboardCheck, FaWalking, FaUsers, FaStar, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getGuideBookings, getGuideByUid } from '../../services/firestoreService';
import { auth } from '../../firebase';

const GuideDashboard = () => {
    const [guide, setGuide] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        completed: 0,
        rating: 0,
        guests: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            const user = auth.currentUser;
            if (user) {
                const guideData = await getGuideByUid(user.uid);
                if (guideData) {
                    setGuide(guideData);
                    localStorage.setItem('guideName', guideData.name);
                    localStorage.setItem('guideId', guideData.id);

                    const guideBookings = await getGuideBookings(guideData.id);
                    setBookings(guideBookings);

                    // Calculate stats
                    const now = new Date();
                    const next30Days = new Date();
                    next30Days.setDate(now.getDate() + 30);

                    const upcoming = guideBookings.filter(b => {
                        const travelDate = new Date(b.travelDate);
                        return travelDate >= now && b.status !== 'cancelled';
                    });

                    const completed = guideBookings.filter(b => b.status === 'completed' || b.status === 'Completed');

                    setStats({
                        total: guideBookings.length,
                        upcoming: upcoming.length,
                        completed: completed.length,
                        rating: guideData.rating || 0,
                        guests: guideBookings.reduce((sum, b) => sum + (parseInt(b.adults || 0) + parseInt(b.children || 0)), 0)
                    });
                }
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'completed': return 'info';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <div className="guide-home">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Hello, {guide?.name || 'Guide'} 👋</h2>
                    <p className="text-muted">Here's what's happening with your tours today.</p>
                </div>
                <Button as={Link} to="/guide/calendar" variant="warning" className="fw-bold">
                    <FaCalendarAlt className="me-2" /> Mark Availability
                </Button>
            </div>

            {/* Quick Stats */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 bg-primary text-white">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-white bg-opacity-25 rounded p-3 me-3">
                                <FaClipboardCheck size={24} />
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">{stats.total}</h3>
                                <p className="mb-0 small opacity-75">Total Bookings</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 bg-success text-white">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-white bg-opacity-25 rounded p-3 me-3">
                                <FaCalendarAlt size={24} />
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">{stats.upcoming}</h3>
                                <p className="mb-0 small opacity-75">Upcoming (30 days)</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 bg-info text-white">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-white bg-opacity-25 rounded p-3 me-3">
                                <FaWalking size={24} />
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">{stats.completed}</h3>
                                <p className="mb-0 small opacity-75">Completed Tours</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100 bg-warning text-dark">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-white bg-opacity-50 rounded p-3 me-3">
                                <FaStar size={24} />
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">{stats.rating}</h3>
                                <p className="mb-0 small opacity-75">Avg. Rating</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Upcoming Bookings List */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Upcoming Bookings</h5>
                            <Button as={Link} to="/guide/bookings" variant="link" className="text-decoration-none p-0">View All</Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-4">Date</th>
                                            <th>Guest</th>
                                            <th>Package</th>
                                            <th>Status</th>
                                            <th className="text-end px-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.slice(0, 7).map((booking) => (
                                            <tr key={booking.id} className="align-middle">
                                                <td className="px-4 fw-medium">
                                                    {new Date(booking.travelDate).toLocaleDateString()}
                                                </td>
                                                <td>{booking.customerName}</td>
                                                <td>{booking.packageTitle}</td>
                                                <td>
                                                    <Badge bg={getStatusVariant(booking.status)}>
                                                        {booking.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-end px-4">
                                                    <Button as={Link} to="/guide/bookings" variant="outline-primary" size="sm">
                                                        Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {bookings.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4 text-muted">No upcoming bookings found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Performance / Info */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4">Profile Summary</h5>
                            <div className="text-center mb-4">
                                <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                    <FaUsers size={30} />
                                </div>
                                <h4 className="fw-bold mb-0">{stats.guests}</h4>
                                <p className="text-muted">Guests Served</p>
                            </div>
                            <div className="d-grid">
                                <Button as={Link} to="/guide/profile" variant="outline-dark">
                                    Update Profile <FaArrowRight className="ms-2" />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm bg-dark text-white">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3 text-warning">Quick Tips</h5>
                            <ul className="small mb-0 ps-3">
                                <li className="mb-2">Always confirm your availability on the calendar.</li>
                                <li className="mb-2">Contact guests 24h before the tour for local coordination.</li>
                                <li className="mb-0">Mark tours as completed promptly after finishing.</li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default GuideDashboard;
