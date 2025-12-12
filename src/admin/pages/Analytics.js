import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaDownload, FaUsers, FaBox, FaCalendarCheck, FaDollarSign, FaStar, FaArrowUp } from 'react-icons/fa';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalUsers: 0,
        activePackages: 8,
        avgRating: 4.7,
        conversionRate: 12.5
    });

    const [monthlyData, setMonthlyData] = useState([]);
    const [packageData, setPackageData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [topPackages, setTopPackages] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = () => {
        // Load bookings
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const totalBookings = bookings.length;

        // Generate monthly booking data (last 6 months)
        const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyBookings = months.map((month, idx) => ({
            month,
            bookings: Math.floor(Math.random() * 20) + 5,
            revenue: Math.floor(Math.random() * 500000) + 100000
        }));

        // Revenue trend data
        const revenueTrend = months.map((month, idx) => ({
            month,
            revenue: Math.floor(Math.random() * 600000) + 200000,
            target: 400000
        }));

        // Package popularity (mock data)
        const packages = [
            { name: 'Sigiriya', bookings: 45, revenue: 2025000 },
            { name: 'Ella', bookings: 38, revenue: 1330000 },
            { name: 'Yala Safari', bookings: 32, revenue: 1280000 },
            { name: 'Coastal Bliss', bookings: 28, revenue: 1680000 },
            { name: 'Kandy', bookings: 25, revenue: 1375000 },
            { name: 'Galle Fort', bookings: 22, revenue: 660000 },
        ];

        // Booking status distribution
        const statusData = [
            { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length || 15 },
            { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length || 5 },
            { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length || 8 },
            { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length || 2 }
        ];

        // Recent activity
        const activities = [
            { type: 'booking', user: 'John Doe', action: 'New booking for Sigiriya Adventure', time: '2 hours ago' },
            { type: 'review', user: 'Sarah Wilson', action: 'Left 5-star review for Ella Hill Climb', time: '5 hours ago' },
            { type: 'contact', user: 'Mike Johnson', action: 'Sent inquiry about Yala Safari', time: '1 day ago' },
            { type: 'booking', user: 'Emma Brown', action: 'Confirmed booking for Coastal Bliss', time: '1 day ago' },
            { type: 'review', user: 'David Lee', action: 'Left review for guide Saman Perera', time: '2 days ago' }
        ];

        setAnalytics({
            totalRevenue,
            totalBookings,
            totalUsers: 0,
            activePackages: 8,
            avgRating: 4.7,
            conversionRate: 12.5
        });

        setMonthlyData(monthlyBookings);
        setRevenueData(revenueTrend);
        setPackageData(statusData);
        setTopPackages(packages);
        setRecentActivity(activities);
    };

    const COLORS = ['#0891b2', '#f59e0b', '#10b981', '#ef4444'];

    const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <p className="text-muted mb-1 small">{title}</p>
                        <h3 className="fw-bold mb-0" style={{ color }}>{value}</h3>
                        {subtitle && <small className="text-muted">{subtitle}</small>}
                        {trend && (
                            <div className="mt-2">
                                <Badge bg={trend > 0 ? 'success' : 'danger'}>
                                    <FaArrowUp className="me-1" />
                                    {trend > 0 ? '+' : ''}{trend}% vs last month
                                </Badge>
                            </div>
                        )}
                    </div>
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '60px', height: '60px', backgroundColor: `${color}20` }}
                    >
                        <Icon size={28} style={{ color }} />
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    const exportData = (type) => {
        alert(`Export ${type} data - Feature coming soon!`);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Analytics & Reports</h2>
                <div>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => exportData('bookings')}>
                        <FaDownload className="me-1" /> Export Bookings
                    </Button>
                    <Button variant="outline-primary" size="sm" onClick={() => exportData('revenue')}>
                        <FaDownload className="me-1" /> Export Revenue
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaDollarSign}
                        title="Total Revenue"
                        value={`LKR ${analytics.totalRevenue.toLocaleString()}`}
                        subtitle="All time earnings"
                        color="#0891b2"
                        trend={15.3}
                    />
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaCalendarCheck}
                        title="Total Bookings"
                        value={analytics.totalBookings || 45}
                        subtitle="Confirmed bookings"
                        color="#f59e0b"
                        trend={8.2}
                    />
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaBox}
                        title="Active Packages"
                        value={analytics.activePackages}
                        subtitle="Available tours"
                        color="#10b981"
                    />
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <StatCard
                        icon={FaStar}
                        title="Avg Rating"
                        value={analytics.avgRating}
                        subtitle="Customer satisfaction"
                        color="#8b5cf6"
                        trend={2.1}
                    />
                </Col>
            </Row>

            {/* Charts Row 1 */}
            <Row className="mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Revenue Trend</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="revenue" stroke="#0891b2" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (LKR)" />
                                    <Area type="monotone" dataKey="target" stroke="#ef4444" fillOpacity={0} name="Target" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Booking Status</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={packageData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {packageData.map((entry, index) => (
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

            {/* Charts Row 2 */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Monthly Bookings & Revenue</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#0891b2" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="bookings" fill="#0891b2" name="Bookings" />
                                    <Bar yAxisId="right" dataKey="revenue" fill="#f59e0b" name="Revenue (LKR)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tables Row */}
            <Row className="mb-4">
                <Col lg={7}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Top Performing Packages</h5>
                            <Table hover responsive>
                                <thead className="bg-light">
                                    <tr>
                                        <th>Package</th>
                                        <th>Bookings</th>
                                        <th>Revenue</th>
                                        <th>Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPackages.map((pkg, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-medium">{pkg.name}</td>
                                            <td><Badge bg="primary">{pkg.bookings}</Badge></td>
                                            <td className="text-success fw-bold">LKR {pkg.revenue.toLocaleString()}</td>
                                            <td>
                                                <Badge bg="success">
                                                    <FaArrowUp className="me-1" />
                                                    {Math.floor(Math.random() * 20 + 5)}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Recent Activity</h5>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {recentActivity.map((activity, idx) => (
                                    <div key={idx} className="mb-3 pb-3 border-bottom">
                                        <div className="d-flex align-items-start">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: activity.type === 'booking' ? '#0891b220' : activity.type === 'review' ? '#f59e0b20' : '#10b98120'
                                                }}
                                            >
                                                {activity.type === 'booking' ? '📅' : activity.type === 'review' ? '⭐' : '💬'}
                                            </div>
                                            <div>
                                                <p className="mb-0 fw-medium">{activity.user}</p>
                                                <small className="text-muted">{activity.action}</small>
                                                <br />
                                                <small className="text-muted">{activity.time}</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Analytics;
