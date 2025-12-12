import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Table, Alert, Badge } from 'react-bootstrap';
import { FaSave, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'AR One Tourism',
        siteEmail: 'contact@arone.lk',
        sitePhone: '+94 11 234 5678',
        maintenanceMode: false,
        allowBookings: true,
        allowReviews: true,
        maxBookingDays: 180
    });

    const [currencyRates, setCurrencyRates] = useState({
        LKR: 1,
        USD: 0.0031,
        EUR: 0.0028,
        GBP: 0.0024,
        INR: 0.26
    });

    const [offers, setOffers] = useState([]);
    const [newOffer, setNewOffer] = useState({ title: '', discount: '', validUntil: '', code: '' });
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        // Load from localStorage
        const savedSettings = localStorage.getItem('adminSettings');
        const savedRates = localStorage.getItem('currencyRates');
        const savedOffers = localStorage.getItem('offers');

        if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedRates) setCurrencyRates(JSON.parse(savedRates));
        if (savedOffers) {
            setOffers(JSON.parse(savedOffers));
        } else {
            // Default offers
            const defaultOffers = [
                { id: 1, title: 'Early Bird Special', discount: '15%', validUntil: '2025-03-31', code: 'EARLY15', active: true },
                { id: 2, title: 'Summer Sale', discount: '20%', validUntil: '2025-08-31', code: 'SUMMER20', active: true }
            ];
            setOffers(defaultOffers);
        }
    };

    const handleSaveSettings = () => {
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleSaveCurrencyRates = () => {
        localStorage.setItem('currencyRates', JSON.stringify(currencyRates));

        // Also update AppContext if needed
        const event = new CustomEvent('currency-rates-updated', { detail: currencyRates });
        window.dispatchEvent(event);

        setSaveMessage('Currency rates updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleAddOffer = () => {
        if (!newOffer.title || !newOffer.discount || !newOffer.validUntil || !newOffer.code) {
            alert('Please fill all offer fields');
            return;
        }

        const offer = {
            id: Date.now(),
            ...newOffer,
            active: true
        };

        const updatedOffers = [...offers, offer];
        setOffers(updatedOffers);
        localStorage.setItem('offers', JSON.stringify(updatedOffers));
        setNewOffer({ title: '', discount: '', validUntil: '', code: '' });
        setSaveMessage('Offer added successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const handleDeleteOffer = (id) => {
        if (window.confirm('Delete this offer?')) {
            const updatedOffers = offers.filter(o => o.id !== id);
            setOffers(updatedOffers);
            localStorage.setItem('offers', JSON.stringify(updatedOffers));
        }
    };

    const handleToggleOffer = (id) => {
        const updated = offers.map(o =>
            o.id === id ? { ...o, active: !o.active } : o
        );
        setOffers(updated);
        localStorage.setItem('offers', JSON.stringify(updated));
    };

    return (
        <div>
            <h2 className="fw-bold mb-4">Admin Settings</h2>

            {saveMessage && (
                <Alert variant="success" dismissible onClose={() => setSaveMessage('')}>
                    {saveMessage}
                </Alert>
            )}

            {/* General Settings */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">General Settings</h5>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Site Name</Form.Label>
                                    <Form.Control
                                        value={settings.siteName}
                                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contact Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={settings.siteEmail}
                                        onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contact Phone</Form.Label>
                                    <Form.Control
                                        value={settings.sitePhone}
                                        onChange={(e) => setSettings({ ...settings, sitePhone: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Max Booking Days in Advance</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={settings.maxBookingDays}
                                        onChange={(e) => setSettings({ ...settings, maxBookingDays: parseInt(e.target.value) })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Check
                                    type="switch"
                                    label="Maintenance Mode"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                    className="mb-3"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Check
                                    type="switch"
                                    label="Allow Bookings"
                                    checked={settings.allowBookings}
                                    onChange={(e) => setSettings({ ...settings, allowBookings: e.target.checked })}
                                    className="mb-3"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Check
                                    type="switch"
                                    label="Allow Reviews"
                                    checked={settings.allowReviews}
                                    onChange={(e) => setSettings({ ...settings, allowReviews: e.target.checked })}
                                    className="mb-3"
                                />
                            </Col>
                        </Row>
                        <Button variant="primary" onClick={handleSaveSettings}>
                            <FaSave className="me-2" /> Save General Settings
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* Currency Exchange Rates */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">Currency Exchange Rates</h5>
                    <small className="text-muted">Base: 1 LKR (Sri Lankan Rupee)</small>
                </Card.Header>
                <Card.Body>
                    <Row>
                        {Object.entries(currencyRates).map(([currency, rate]) => (
                            <Col md={4} key={currency}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">{currency}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.00001"
                                        value={rate}
                                        onChange={(e) => setCurrencyRates({ ...currencyRates, [currency]: parseFloat(e.target.value) })}
                                        disabled={currency === 'LKR'}
                                    />
                                </Form.Group>
                            </Col>
                        ))}
                    </Row>
                    <Button variant="primary" onClick={handleSaveCurrencyRates}>
                        <FaSave className="me-2" /> Save Currency Rates
                    </Button>
                </Card.Body>
            </Card>

            {/* Offers & Discounts */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">Offers & Discount Codes</h5>
                </Card.Header>
                <Card.Body>
                    {/* Add New Offer */}
                    <Card className="bg-light mb-3">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Add New Offer</h6>
                            <Row>
                                <Col md={3}>
                                    <Form.Control
                                        placeholder="Offer Title"
                                        value={newOffer.title}
                                        onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                                        className="mb-2"
                                    />
                                </Col>
                                <Col md={2}>
                                    <Form.Control
                                        placeholder="Discount (e.g., 20%)"
                                        value={newOffer.discount}
                                        onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                                        className="mb-2"
                                    />
                                </Col>
                                <Col md={2}>
                                    <Form.Control
                                        type="date"
                                        placeholder="Valid Until"
                                        value={newOffer.validUntil}
                                        onChange={(e) => setNewOffer({ ...newOffer, validUntil: e.target.value })}
                                        className="mb-2"
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Control
                                        placeholder="Code (e.g., SUMMER20)"
                                        value={newOffer.code}
                                        onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value.toUpperCase() })}
                                        className="mb-2"
                                    />
                                </Col>
                                <Col md={2}>
                                    <Button variant="success" onClick={handleAddOffer} className="w-100">
                                        <FaPlus className="me-1" /> Add
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Offers List */}
                    <Table hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Title</th>
                                <th>Discount</th>
                                <th>Code</th>
                                <th>Valid Until</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.length > 0 ? offers.map(offer => (
                                <tr key={offer.id}>
                                    <td className="fw-medium">{offer.title}</td>
                                    <td><Badge bg="success">{offer.discount}</Badge></td>
                                    <td><code>{offer.code}</code></td>
                                    <td>{new Date(offer.validUntil).toLocaleDateString()}</td>
                                    <td>
                                        <Form.Check
                                            type="switch"
                                            checked={offer.active}
                                            onChange={() => handleToggleOffer(offer.id)}
                                            label={offer.active ? 'Active' : 'Inactive'}
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeleteOffer(offer.id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">No offers yet</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Notification Settings */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">Notification Settings</h5>
                </Card.Header>
                <Card.Body>
                    <Alert variant="info">
                        <strong>Note:</strong> Email and SMS notification features require backend integration (Firebase Cloud Functions + Twilio/SendGrid).
                        These settings are saved but not yet functional.
                    </Alert>
                    <Form.Check
                        type="switch"
                        label="Send booking confirmation emails"
                        className="mb-2"
                    />
                    <Form.Check
                        type="switch"
                        label="Send booking reminder emails (24 hours before trip)"
                        className="mb-2"
                    />
                    <Form.Check
                        type="switch"
                        label="Send SMS notifications for bookings"
                        className="mb-2"
                    />
                    <Form.Check
                        type="switch"
                        label="Notify admin of new bookings"
                        className="mb-2"
                    />
                </Card.Body>
            </Card>
        </div>
    );
};

export default AdminSettings;
