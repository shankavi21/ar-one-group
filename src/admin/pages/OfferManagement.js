import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaTags } from 'react-icons/fa';
import { getAllOffers, addOffer, updateOffer, deleteOffer } from '../../services/firestoreService';

const OfferManagement = () => {
    const [offers, setOffers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount: '',
        code: '',
        validUntil: '',
        image: '',
        status: 'active'
    });

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            const data = await getAllOffers();
            setOffers(data);
        } catch (error) {
            console.error("Failed to load offers", error);
        }
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);
        setFormData({
            title: offer.title || '',
            description: offer.description || '',
            discount: offer.discount || '',
            code: offer.code || '',
            validUntil: offer.validUntil || '',
            image: offer.image || '',
            status: offer.status || 'active'
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.title || !formData.discount) {
                alert('Title and Discount are required!');
                return;
            }

            if (editingOffer && editingOffer.id) {
                await updateOffer(editingOffer.id, formData);
                alert('Offer updated successfully!');
            } else {
                await addOffer(formData);
                alert('Offer created successfully!');
            }
            loadOffers();
            setShowModal(false);
            setEditingOffer(null);
            setFormData({
                title: '',
                description: '',
                discount: '',
                code: '',
                validUntil: '',
                image: '',
                status: 'active'
            });
        } catch (error) {
            console.error("Error saving offer", error);
            alert("Failed to save offer");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            try {
                await deleteOffer(id);
                loadOffers();
                alert('Offer deleted successfully!');
            } catch (error) {
                console.error("Error deleting offer", error);
                alert("Failed to delete offer");
            }
        }
    };

    const handleAddNew = () => {
        setEditingOffer(null);
        setFormData({
            title: '',
            description: '',
            discount: '',
            code: '',
            validUntil: '',
            image: '',
            status: 'active'
        });
        setShowModal(true);
    };

    // Calculate if expired
    const isExpired = (dateString) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Offer & Discount Management</h2>
                <Button variant="primary" onClick={handleAddNew}>
                    <FaPlus className="me-2" /> Add New Offer
                </Button>
            </div>

            <Row>
                {offers.map(offer => (
                    <Col md={6} lg={4} key={offer.id} className="mb-4">
                        <Card className={`h-100 border-0 shadow-sm ${offer.status === 'inactive' ? 'opacity-50' : ''}`}>
                            <div className="position-relative">
                                {offer.image && (
                                    <Card.Img variant="top" src={offer.image} style={{ height: '150px', objectFit: 'cover' }} />
                                )}
                                <div className="position-absolute top-0 end-0 m-2">
                                    <Badge bg={offer.status === 'active' && !isExpired(offer.validUntil) ? 'success' : 'secondary'}>
                                        {offer.status === 'active' && isExpired(offer.validUntil) ? 'EXPIRED' : offer.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <Card.Title className="fw-bold">{offer.title}</Card.Title>
                                    <Badge bg="warning" text="dark" className="fs-6">{offer.discount}</Badge>
                                </div>
                                <p className="text-secondary small mb-3">{offer.description}</p>

                                <div className="d-flex align-items-center mb-2">
                                    <FaTags className="text-primary me-2" />
                                    <span className="fw-bold font-monospace bg-light px-2 rounded text-dark">{offer.code || 'NO CODE'}</span>
                                </div>

                                {offer.validUntil && (
                                    <div className={`small mb-3 ${isExpired(offer.validUntil) ? 'text-danger fw-bold' : 'text-muted'}`}>
                                        Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                                    </div>
                                )}

                                <div className="d-flex gap-2 mt-3 pt-3 border-top">
                                    <Button variant="outline-primary" size="sm" className="flex-grow-1" onClick={() => handleEdit(offer)}>
                                        <FaEdit className="me-1" /> Edit
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(offer.id)}>
                                        <FaTrash />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Offer Title *</Form.Label>
                                    <Form.Control
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Summer Sale"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Discount *</Form.Label>
                                    <Form.Control
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        placeholder="e.g. 20% OFF or LKR 5000 OFF"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Promo Code (Optional)</Form.Label>
                                    <Form.Control
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="e.g. SUMMER2024"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Valid Until</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                    />
                                    <Form.Text className="text-muted">Leave empty if indefinite</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Image URL (Optional)</Form.Label>
                            <Form.Control
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="/path/to/banner.jpg"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Terms and conditions or details..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save Offer</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OfferManagement;
