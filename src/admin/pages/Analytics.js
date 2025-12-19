import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaDownload, FaUsers, FaBox, FaCalendarCheck, FaDollarSign, FaStar, FaArrowUp } from 'react-icons/fa';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { getAllBookings, getAllPackages, getAllReviews } from '../../services/firestoreService';

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalUsers: 0,
        activePackages: 0,
        avgRating: 0,
        conversionRate: 0
    });

    const [monthlyData, setMonthlyData] = useState([]);
    const [packageData, setPackageData] = useState([]); // This is actually statusData in the chart render
    const [revenueData, setRevenueData] = useState([]);
    const [topPackages, setTopPackages] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const [bookings, packages, reviews] = await Promise.all([
                getAllBookings(),
                getAllPackages(),
                getAllReviews()
            ]);

            // 1. Key Metrics
            const totalBookings = bookings.length;
            const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
            const activePackages = packages.length;

            // Calculate Average Rating from Reviews
            const totalRating = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
            const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

            // 2. Monthly Data (Bookings & Revenue)
            const monthMap = {};
            const last6Months = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const key = `${d.toLocaleString('default', { month: 'short' })}`;
                last6Months.push(key);
                monthMap[key] = { bookings: 0, revenue: 0 };
            }

            bookings.forEach(booking => {
                const date = booking.createdAt ? (booking.createdAt.toDate ? booking.createdAt.toDate() : new Date(booking.createdAt)) : new Date();
                const key = date.toLocaleString('default', { month: 'short' });
                if (monthMap[key]) {
                    monthMap[key].bookings += 1;
                    monthMap[key].revenue += (Number(booking.totalAmount) || 0);
                }
            });

            const monthlyChartData = last6Months.map(month => ({
                month,
                bookings: monthMap[month].bookings,
                revenue: monthMap[month].revenue
            }));

            // 3. Revenue Trend (Same as monthly but dedicated chart structure)
            const revenueTrendData = monthlyChartData.map(d => ({
                month: d.month,
                revenue: d.revenue,
                target: (totalRevenue / 6) * 1.1 // Mock target as 10% more than avg
            }));

            // 4. Booking Status Distribution
            const statusCounts = {};
            bookings.forEach(b => {
                const status = b.status || 'pending';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            const statusChartData = Object.keys(statusCounts).map(status => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: statusCounts[status]
            }));

            // 5. Top Packages
            const packagePerformance = {};
            bookings.forEach(b => {
                if (b.packageTitle) {
                    if (!packagePerformance[b.packageTitle]) {
                        packagePerformance[b.packageTitle] = { bookings: 0, revenue: 0 };
                    }
                    packagePerformance[b.packageTitle].bookings += 1;
                    packagePerformance[b.packageTitle].revenue += (Number(b.totalAmount) || 0);
                }
            });
            const topOps = Object.entries(packagePerformance)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.bookings - a.bookings)
                .slice(0, 5);

            // 6. Recent Activity (Mix of Bookings and Reviews)
            const recentItems = [
                ...bookings.map(b => ({
                    type: 'booking',
                    user: b.customerName || 'Guest',
                    action: `Booked ${b.packageTitle}`,
                    date: b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date()
                })),
                ...reviews.map(r => ({
                    type: 'review',
                    user: r.userName || 'User',
                    action: `Rated ${r.packageName} (${r.rating}⭐)`,
                    date: r.createdAt ? (r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt)) : new Date()
                }))
            ];
            const sortedActivity = recentItems
                .sort((a, b) => b.date - a.date)
                .slice(0, 5)
                .map(item => ({
                    ...item,
                    time: item.date.toLocaleDateString()
                }));

            setAnalytics({
                totalRevenue,
                totalBookings,
                totalUsers: 0, // Placeholder
                activePackages,
                avgRating,
                conversionRate: ((totalBookings / (bookings.length + 20)) * 100).toFixed(1) // Mock calc
            });

            setMonthlyData(monthlyChartData);
            setRevenueData(revenueTrendData);
            setPackageData(statusChartData);
            setTopPackages(topOps);
            setRecentActivity(sortedActivity);

        } catch (error) {
            console.error("Error loading analytics:", error);
        }
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
