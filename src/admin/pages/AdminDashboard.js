import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FaUsers, FaBox, FaCalendarCheck, FaEnvelope, FaUserTie, FaDollarSign } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { getAllUsers, getAllBookings, getAllPackages, getAllGuides, getAllContacts } from '../../services/firestoreService';
import { seedDatabase } from '../../utils/seeder';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBookings: 0,
        totalPackages: 0,
        totalGuides: 0,
        pendingContacts: 0,
        totalRevenue: 0
    });

    const [recentBookings, setRecentBookings] = useState([]);
    const [bookingsByMonth, setBookingsByMonth] = useState([]);
    const [bookingsByStatus, setBookingsByStatus] = useState([]);
    const [seeding, setSeeding] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handleSeed = async () => {
        if (!window.confirm("This will populate the database with sample packages and guides if it's empty. Continue?")) return;

        setSeeding(true);
        try {
            const result = await seedDatabase();
            if (result.success) {
                alert("✅ " + result.message);
                loadDashboardData();
            } else {
                alert("ℹ️ " + result.message);
            }
        } catch (error) {
            alert("❌ Error seeding database: " + error.message);
        } finally {
            setSeeding(false);
        }
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [users, bookings, packages, guides, contacts] = await Promise.all([
                getAllUsers(),
                getAllBookings(),
                getAllPackages(),
                getAllGuides(),
                getAllContacts()
            ]);

            // Calculate Stats
            const totalUsers = users.length;
            const totalBookings = bookings.length;
            const totalPackages = packages.length; // Count all or filter by status if needed
            const totalGuides = guides.length;
            const pendingContacts = contacts.filter(c => c.status === 'pending').length;
            const totalRevenue = bookings.reduce((sum, booking) => sum + (Number(booking.totalAmount) || 0), 0);

            // Recent Bookings (already sorted by desc in service usually, but ensure limit)
            const recent = bookings.slice(0, 5);

            // Bookings by Month
            const monthData = {};
            bookings.forEach(booking => {
                const dateVal = booking.createdAt ? (booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt)) : new Date();
                const monthYear = `${dateVal.getMonth() + 1}/${dateVal.getFullYear()}`;
                monthData[monthYear] = (monthData[monthYear] || 0) + 1;
            });

            const monthChartData = Object.entries(monthData).map(([month, count]) => ({
                month,
                bookings: count
            }));

            // Bookings by Status
            const statusData = {};
            bookings.forEach(booking => {
                const status = booking.status || 'pending';
                statusData[status] = (statusData[status] || 0) + 1;
            });

            const statusChartData = Object.entries(statusData).map(([status, count]) => ({
                status,
                value: count
            }));

            setStats({
                totalUsers,
                totalBookings,
                totalPackages,
                totalGuides,
                pendingContacts,
                totalRevenue
            });

            setRecentBookings(recent);
            setBookingsByMonth(monthChartData);
            setBookingsByStatus(statusChartData);

        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0891b2', '#f59e0b', '#10b981', '#ef4444'];

    const StatCard = ({ icon: Icon, title, value, color, subtext }) => (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <p className="text-muted mb-1 small">{title}</p>
                        <h3 className="fw-bold mb-0" style={{ color: color }}>{value}</h3>
                        {subtext && <small className="text-muted">{subtext}</small>}
                    </div>
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '60px', height: '60px', backgroundColor: `${color}20` }}
                    >
                        <Icon size={28} style={{ color: color }} />
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    const getStatusBadge = (status) => {
        const variants = {
            confirmed: 'success',
            pending: 'warning',
            completed: 'info',
            cancelled: 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status?.toUpperCase()}</Badge>;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Dashboard Overview</h2>
                <button
                    className="btn btn-outline-primary rounded-pill px-4"
                    onClick={handleSeed}
                    disabled={seeding}
                >
                    {seeding ? 'Seeding...' : 'Initialize Sample Data'}
                </button>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaUsers}
                        title="Total Users"
                        value={stats.totalUsers || 'N/A'}
                        color="#0891b2"
                        subtext="Registered users"
                    />
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaCalendarCheck}
                        title="Total Bookings"
                        value={stats.totalBookings}
                        color="#f59e0b"
                        subtext="All time bookings"
                    />
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaBox}
                        title="Active Packages"
                        value={stats.totalPackages}
                        color="#10b981"
                        subtext="Tour packages"
                    />
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaEnvelope}
                        title="Pending Contacts"
                        value={stats.pendingContacts}
                        color="#ef4444"
                        subtext="Needs attention"
                    />
                </Col>
            </Row>

            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaUserTie}
                        title="Tour Guides"
                        value={stats.totalGuides}
                        color="#8b5cf6"
                        subtext="Available guides"
                    />
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaDollarSign}
                        title="Total Revenue"
                        value={`LKR ${stats.totalRevenue.toLocaleString()}`}
                        color="#ec4899"
                        subtext="From all bookings"
                    />
                </Col>
            </Row>

            {/* Charts */}
            <Row className="mb-4">
                <Col lg={8} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Bookings by Month</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={bookingsByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="bookings" fill="#0891b2" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Bookings by Status</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={bookingsByStatus}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ status, value }) => `${status}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {bookingsByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Bookings */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <h5 className="fw-bold mb-3">Recent Bookings</h5>
                    <div className="table-responsive">
                        <Table hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Customer</th>
                                    <th>Package</th>
                                    <th>Date</th>
                                    <th>Guests</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.length > 0 ? (
                                    recentBookings.map(booking => (
                                        <tr key={booking.bookingId}>
                                            <td className="fw-medium">{booking.bookingId}</td>
                                            <td>{booking.customerName}</td>
                                            <td>{booking.packageTitle}</td>
                                            <td>{new Date(booking.travelDate).toLocaleDateString()}</td>
                                            <td>{booking.adults + booking.children}</td>
                                            <td className="fw-bold text-success">LKR {booking.totalAmount?.toLocaleString()}</td>
                                            <td>{getStatusBadge(booking.status)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            No bookings yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AdminDashboard;
