import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge, InputGroup, Row, Col, Image } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaStar } from 'react-icons/fa';

import { getAllGuides, addGuide, updateGuide, deleteGuide } from '../../services/firestoreService';

const GuideManagement = () => {
    const [guides, setGuides] = useState([]);
    const [filteredGuides, setFilteredGuides] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingGuide, setEditingGuide] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        location: '',
        rating: 4.5,
        bio: '',
        languages: [],
        experience: '',
        image: '',
        status: 'pending',
        phone: '',
        email: ''
    });

    useEffect(() => {
        loadGuides();
    }, []);

    useEffect(() => {
        filterGuides();
    }, [searchTerm, guides]);

    const loadGuides = async () => {
        try {
            const data = await getAllGuides();
            setGuides(data);
        } catch (error) {
            console.error("Failed to load guides", error);
        }
    };

    const filterGuides = () => {
        if (!searchTerm) {
            setFilteredGuides(guides);
            return;
        }

        const filtered = guides.filter(guide =>
            guide.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guide.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guide.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredGuides(filtered);
    };

    const handleEdit = (guide) => {
        setEditingGuide(guide);
        setFormData({
            name: guide.name || '',
            role: guide.role || '',
            location: guide.location || '',
            rating: guide.rating || 4.5,
            bio: guide.bio || '',
            languages: guide.languages || [],
            experience: guide.experience || '',
            image: guide.image || '',
            status: guide.status || 'pending',
            phone: guide.phone || '',
            email: guide.email || ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingGuide && editingGuide.id) {
                // Edit existing
                await updateGuide(editingGuide.id, formData);
                alert('Guide updated successfully!');
            } else {
                // Add new
                await addGuide(formData);
                alert('Guide added successfully!');
            }
            loadGuides();
            setShowModal(false);
            setEditingGuide(null);
        } catch (error) {
            console.error("Error saving guide", error);
            alert("Failed to save guide");
        }
    };

    const handleDelete = async (guideId) => {
        if (window.confirm('Are you sure you want to delete this guide?')) {
            try {
                await deleteGuide(guideId);
                loadGuides();
                alert('Guide deleted successfully!');
            } catch (error) {
                console.error("Error deleting guide", error);
                alert("Failed to delete guide");
            }
        }
    };

    const handleStatusChange = async (guideId, newStatus) => {
        try {
            await updateGuide(guideId, { status: newStatus });
            loadGuides();
            alert(`Guide ${newStatus}!`);
        } catch (error) {
            console.error("Error updating status", error);
            alert("Failed to update status");
        }
    };

    const handleAddNew = () => {
        setEditingGuide(null);
        setFormData({
            name: '',
            role: '',
            location: '',
            rating: 4.5,
            bio: '',
            languages: [],
            experience: '',
            image: '',
            status: 'pending',
            phone: '',
            email: ''
        });
        setShowModal(true);
    };

    const handleLanguageChange = (lang) => {
        const languages = formData.languages || [];
        if (languages.includes(lang)) {
            setFormData({ ...formData, languages: languages.filter(l => l !== lang) });
        } else {
            setFormData({ ...formData, languages: [...languages, lang] });
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            approved: 'success',
            pending: 'warning',
            rejected: 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status?.toUpperCase()}</Badge>;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Guide Management</h2>
                <Button variant="primary" onClick={handleAddNew}>
                    <FaPlus className="me-2" /> Add New Guide
                </Button>
            </div>

            {/* Search */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search guides by name, role, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Card.Body>
            </Card>

            {/* Stats */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1">Total Guides</p>
                            <h3 className="fw-bold mb-0">{guides.length}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1">Approved</p>
                            <h3 className="fw-bold mb-0 text-success">
                                {guides.filter(g => g.status === 'approved').length}
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1">Pending</p>
                            <h3 className="fw-bold mb-0 text-warning">
                                {guides.filter(g => g.status === 'pending').length}
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1">Avg Rating</p>
                            <h3 className="fw-bold mb-0 text-primary">
                                <FaStar className="text-warning" /> {(guides.reduce((sum, g) => sum + g.rating, 0) / guides.length).toFixed(1)}
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Guides Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Location</th>
                                    <th>Languages</th>
                                    <th>Experience</th>
                                    <th>Rating</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGuides.map(guide => (
                                    <tr key={guide.id}>
                                        <td>
                                            <Image src={guide.image} roundedCircle width="40" height="40" />
                                        </td>
                                        <td className="fw-medium">{guide.name}</td>
                                        <td>{guide.role}</td>
                                        <td>{guide.location}</td>
                                        <td>
                                            {guide.languages?.map((lang, idx) => (
                                                <Badge key={idx} bg="info" className="me-1">{lang}</Badge>
                                            ))}
                                        </td>
                                        <td>{guide.experience}</td>
                                        <td><FaStar className="text-warning" /> {guide.rating}</td>
                                        <td>{getStatusBadge(guide.status)}</td>
                                        <td>
                                            {guide.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="me-1"
                                                        onClick={() => handleStatusChange(guide.id, 'approved')}
                                                    >
                                                        <FaCheck />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="me-1"
                                                        onClick={() => handleStatusChange(guide.id, 'rejected')}
                                                    >
                                                        <FaTimes />
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(guide)}>
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(guide.id)}>
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Edit/Add Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingGuide?.id ? 'Edit Guide' : 'Add New Guide'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name *</Form.Label>
                                    <Form.Control
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Role/Expertise *</Form.Label>
                                    <Form.Control
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone *</Form.Label>
                                    <Form.Control
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Experience</Form.Label>
                                    <Form.Control
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        placeholder="e.g., 10 years"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Rating</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Languages</Form.Label>
                            <div>
                                {['English', 'Sinhala', 'Tamil', 'Hindi', 'German', 'French', 'Chinese', 'Japanese'].map(lang => (
                                    <Form.Check
                                        key={lang}
                                        inline
                                        type="checkbox"
                                        label={lang}
                                        checked={formData.languages?.includes(lang)}
                                        onChange={() => handleLanguageChange(lang)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Guide
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GuideManagement;
