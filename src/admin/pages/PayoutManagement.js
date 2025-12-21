import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge, Row, Col, Alert } from 'react-bootstrap';
import { FaDollarSign, FaHistory, FaCheckCircle, FaUserTie, FaCalendarAlt } from 'react-icons/fa';
import { getAllBookings, getAllPayouts, recordGuidePayout, getAllGuides } from '../../services/firestoreService';

const PayoutManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allBookings, allPayouts, allGuides] = await Promise.all([
                getAllBookings(),
                getAllPayouts(),
                getAllGuides()
            ]);

            // Only need bookings that have a guide assigned
            setBookings(allBookings.filter(b => b.guide && b.guide.id));
            setPayouts(allPayouts);
            setGuides(allGuides);
        } catch (error) {
            console.error("Error loading payout data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPayoutModal = (booking) => {
        setSelectedBooking(booking);
        // Default amount could be a commission or fixed fee
        setAmount(booking.guideCommission || 50);
        setNotes(`Payment for tour: ${booking.packageTitle} (Booking: ${booking.bookingId})`);
        setShowPayoutModal(true);
    };

    const handleSubmitPayout = async (e) => {
        e.preventDefault();
        if (!selectedBooking) return;

        setSubmitting(true);
        try {
            const payoutData = {
                bookingId: selectedBooking.bookingId,
                bookingDocId: selectedBooking.id,
                guideId: selectedBooking.guide.id,
                guideName: selectedBooking.guide.name,
                packageTitle: selectedBooking.packageTitle,
                amount: Number(amount),
                notes: notes,
                payoutDate: new Date().toISOString(),
                status: 'completed'
            };

            await recordGuidePayout(payoutData);
            alert("Payment recorded successfully!");
            setShowPayoutModal(false);
            loadData();
        } catch (error) {
            console.error("Error recording payout:", error);
            alert("Failed to record payment.");
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate unpaid completed bookings
    const pendingBookings = bookings.filter(b => {
        if (b.status !== 'completed') return false;
        // Check if a payout already exists for this bookingDocId
        return !payouts.some(p => p.bookingDocId === b.id);
    });

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Guide Payouts</h2>
            </div>

            <Row className="mb-4 text-center">
                <Col md={4} className="mb-3">
                    <Card className="border-0 shadow-sm bg-warning text-dark">
                        <Card.Body className="p-4">
                            <h2 className="fw-bold mb-0">{pendingBookings.length}</h2>
                            <p className="mb-0 opacity-75">Pending Payouts</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="border-0 shadow-sm bg-success text-white">
                        <Card.Body className="p-4">
                            <h2 className="fw-bold mb-0">${payouts.reduce((sum, p) => sum + p.amount, 0)}</h2>
                            <p className="mb-0 opacity-75">Processed Payouts</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="border-0 shadow-sm bg-info text-white">
                        <Card.Body className="p-4">
                            <h2 className="fw-bold mb-0">{payouts.length}</h2>
                            <p className="mb-0 opacity-75">Total Transactions</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Pending Payouts */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold text-warning"><FaDollarSign className="me-2" /> Pending Payments (Completed Tours)</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4">Guide</th>
                                    <th>Booking ID</th>
                                    <th>Tour</th>
                                    <th>Comp. Date</th>
                                    <th className="text-end px-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingBookings.length > 0 ? (
                                    pendingBookings.map(b => (
                                        <tr key={b.id} className="align-middle">
                                            <td className="px-4">
                                                <div className="fw-bold">{b.guide?.name}</div>
                                                <small className="text-muted">{b.guide?.role}</small>
                                            </td>
                                            <td>{b.bookingId}</td>
                                            <td>{b.packageTitle}</td>
                                            <td>{new Date(b.travelDate).toLocaleDateString()}</td>
                                            <td className="text-end px-4">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleOpenPayoutModal(b)}
                                                    className="rounded-pill"
                                                >
                                                    Record Payment
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">All guide payments for completed tours are up to date.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Payment History */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold"><FaHistory className="me-2 text-muted" /> Payout History</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4">Date</th>
                                    <th>Guide</th>
                                    <th>Tour</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th className="px-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.length > 0 ? (
                                    payouts.map(p => (
                                        <tr key={p.id} className="align-middle">
                                            <td className="px-4">{new Date(p.payoutDate).toLocaleDateString()}</td>
                                            <td>{p.guideName}</td>
                                            <td>{p.packageTitle || 'N/A'}</td>
                                            <td><span className="fw-bold text-success">${p.amount}</span></td>
                                            <td><Badge bg="success">PAID</Badge></td>
                                            <td className="px-4 small text-muted">{p.notes}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">No payout history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Record Payout Modal */}
            <Modal show={showPayoutModal} onHide={() => !submitting && setShowPayoutModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Record Guide Payment</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmitPayout}>
                    <Modal.Body className="p-4">
                        {selectedBooking && (
                            <div className="mb-4 p-3 bg-light rounded-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Guide:</span>
                                    <span className="fw-bold">{selectedBooking.guide?.name}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Booking:</span>
                                    <span>{selectedBooking.bookingId}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Tour:</span>
                                    <span>{selectedBooking.packageTitle}</span>
                                </div>
                            </div>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Payment Amount ($)</Form.Label>
                            <Form.Control
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="form-control-lg"
                                placeholder="Enter amount..."
                            />
                            <Form.Text className="text-muted">Enter the total amount to be paid to the guide for this service.</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Notes / Reference</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="E.g. Paid via Bank Transfer, Reference ID..."
                            />
                        </Form.Group>

                        <Alert variant="info" className="small mb-0">
                            <strong>Note:</strong> Recording this payment will reflect immediately in the guide's dashboard under their "Earnings" section.
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPayoutModal(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={submitting} className="fw-bold px-4">
                            {submitting ? 'Recording...' : 'Confirm Payment'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default PayoutManagement;
