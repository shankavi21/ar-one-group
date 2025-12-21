import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { FaWallet, FaChartLine, FaCheckCircle, FaHistory, FaClock } from 'react-icons/fa';
import { getGuideBookings, getGuidePayouts } from '../../services/firestoreService';

const GuideEarnings = () => {
    const [payouts, setPayouts] = useState([]);
    const [pendingPayouts, setPendingPayouts] = useState([]);
    const [stats, setStats] = useState({
        totalEarned: 0,
        pendingAmount: 0,
        completedTours: 0,
        thisMonth: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const gid = localStorage.getItem('guideId');
        if (gid) {
            loadEarnings(gid);
        }
    }, []);

    const loadEarnings = async (gid) => {
        setLoading(true);
        try {
            const [payoutData, bookingData] = await Promise.all([
                getGuidePayouts(gid),
                getGuideBookings(gid)
            ]);

            const completed = bookingData.filter(b => b.status?.toLowerCase() === 'completed');

            // Pending payouts = completed tours where NO payout record exists yet
            const pending = completed.filter(b => !payoutData.some(p => p.bookingDocId === b.id));
            const pendingTotal = pending.reduce((sum, b) => sum + (b.guideCommission || 50), 0);

            const total = payoutData.reduce((sum, p) => sum + (p.amount || 0), 0);

            const now = new Date();
            const thisMonthTotal = payoutData.filter(p => {
                const d = new Date(p.payoutDate);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).reduce((sum, p) => sum + (p.amount || 0), 0);

            setPayouts(payoutData);
            setPendingPayouts(pending);
            setStats({
                totalEarned: total,
                pendingAmount: pendingTotal,
                completedTours: completed.length,
                thisMonth: thisMonthTotal
            });
        } catch (error) {
            console.error("Error loading earnings", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Calculating your earnings...</p>
            </div>
        );
    }

    return (
        <div className="guide-earnings">
            <h2 className="fw-bold mb-4">Earnings & Payouts</h2>

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm bg-primary text-white">
                        <Card.Body className="p-4">
                            <FaWallet className="mb-3 opacity-50" size={30} />
                            <h3 className="fw-bold mb-0">${stats.totalEarned}</h3>
                            <p className="mb-0 small opacity-75">Paid Earnings</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm bg-warning text-dark">
                        <Card.Body className="p-4">
                            <FaClock className="mb-3 opacity-50" size={30} />
                            <h3 className="fw-bold mb-0">${stats.pendingAmount}</h3>
                            <p className="mb-0 small opacity-75">Pending Payout</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm bg-success text-white">
                        <Card.Body className="p-4">
                            <FaChartLine className="mb-3 opacity-50" size={30} />
                            <h3 className="fw-bold mb-0">${stats.thisMonth}</h3>
                            <p className="mb-0 small opacity-75">Paid This Month</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm bg-info text-white">
                        <Card.Body className="p-4">
                            <FaCheckCircle className="mb-3 opacity-50" size={30} />
                            <h3 className="fw-bold mb-0">{stats.completedTours}</h3>
                            <p className="mb-0 small opacity-75">Tours Completed</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold"><FaHistory className="me-2 text-muted" /> Payment History</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4">Date</th>
                                    <th>Booking ID</th>
                                    <th>Tour Name</th>
                                    <th>Amount</th>
                                    <th className="text-end px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((p) => (
                                    <tr key={p.id} className="align-middle">
                                        <td className="px-4">{new Date(p.payoutDate).toLocaleDateString()}</td>
                                        <td>{p.bookingId}</td>
                                        <td>{p.packageTitle}</td>
                                        <td className="fw-bold text-success">${p.amount}</td>
                                        <td className="text-end px-4">
                                            <Badge bg="success">Paid</Badge>
                                        </td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">No payout records found yet.</td>
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

export default GuideEarnings;
