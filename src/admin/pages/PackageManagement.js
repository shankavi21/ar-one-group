import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge, InputGroup, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';

import { getAllPackages, addPackage, updatePackage, deletePackage } from '../../services/firestoreService';

const PackageManagement = () => {
    const [packages, setPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        price: '',
        duration: '',
        description: '',
        image: '',
        rating: 4.5,
        included: [],
        transport: '',
        food: '',
        mapLocation: '',
        gallery: [],
        hotels: []
    });
    const [jsonError, setJsonError] = useState('');

    useEffect(() => {
        loadPackages();
    }, []);

    useEffect(() => {
        filterPackages();
    }, [searchTerm, packages]);

    const loadPackages = async () => {
        try {
            const data = await getAllPackages();
            setPackages(data);
        } catch (error) {
            console.error("Failed to load packages", error);
        }
    };

    const filterPackages = () => {
        if (!searchTerm) {
            setFilteredPackages(packages);
            return;
        }

        const filtered = packages.filter(pkg =>
            pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPackages(filtered);
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            title: pkg.title || '',
            location: pkg.location || '',
            price: pkg.price || '',
            duration: pkg.duration || '',
            description: pkg.description || '',
            image: pkg.image || '',
            rating: pkg.rating || 4.5,
            included: pkg.included || [],
            transport: pkg.transport || '',
            food: pkg.food || '',
            mapLocation: pkg.mapLocation || '',
            gallery: pkg.gallery || [],
            hotels: pkg.hotels || []
        });
        setJsonError(''); // Clear errors
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            // Parse hotels if it's a string (from text area)
            let parsedHotels = formData.hotels;
            if (typeof parsedHotels === 'string') {
                try {
                    parsedHotels = JSON.parse(parsedHotels);
                } catch (e) {
                    alert("Invalid JSON in Hotels field. Please check format.");
                    return;
                }
            }

            // Ensure numeric values are saved as numbers
            const packageData = {
                ...formData,
                price: Number(formData.price),
                rating: Number(formData.rating),
                hotels: parsedHotels
            };

            if (editingPackage && editingPackage.id) {
                // Update existing
                await updatePackage(editingPackage.id, packageData);
                alert('Package updated successfully!');
            } else {
                // Add new
                await addPackage({ ...packageData, status: 'active' });
                alert('Package added successfully!');
            }
            loadPackages(); // Reload to get fresh data
            setShowModal(false);
            setEditingPackage(null);
        } catch (error) {
            console.error("Error saving package", error);
            alert("Failed to save package");
        }
    };

    const handleDelete = async (packageId) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await deletePackage(packageId);
                loadPackages();
                alert('Package deleted successfully!');
            } catch (error) {
                console.error("Error deleting package", error);
                alert("Failed to delete package");
            }
        }
    };

    const handleAddNew = () => {
        setEditingPackage(null); // Clear editing state
        setFormData({
            title: '',
            location: '',
            price: '',
            duration: '',
            description: '',
            image: '',
            rating: 4.5,
            included: [],
            transport: '',
            food: '',
            mapLocation: '',
            gallery: [],
            hotels: []
        });
        setJsonError('');
        setShowModal(true);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Package Management</h2>
                <Button variant="primary" onClick={handleAddNew}>
                    <FaPlus className="me-2" /> Add New Package
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
                            placeholder="Search packages by title or location..."
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
                            <p className="text-muted mb-1">Total Packages</p>
                            <h3 className="fw-bold mb-0">{packages.length}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1">Active</p>
                            <h3 className="fw-bold mb-0 text-success">
                                {packages.filter(p => p.status === 'active').length}
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1">Avg Price</p>
                            <h3 className="fw-bold mb-0 text-primary">
                                LKR {Math.round(packages.reduce((sum, p) => sum + Number(p.price), 0) / (packages.length || 1)).toLocaleString()}
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Packages Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Location</th>
                                    <th>Price</th>
                                    <th>Duration</th>
                                    <th>Rating</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPackages.map(pkg => (
                                    <tr key={pkg.id}>
                                        <td>
                                            <img src={pkg.image} alt={pkg.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                                        </td>
                                        <td className="fw-medium">{pkg.title}</td>
                                        <td>{pkg.location}</td>
                                        <td className="text-success fw-bold">LKR {pkg.price.toLocaleString()}</td>
                                        <td>{pkg.duration}</td>
                                        <td>⭐ {pkg.rating}</td>
                                        <td>
                                            <Badge bg="success">{pkg.status}</Badge>
                                        </td>
                                        <td>
                                            <Button variant="outline-info" size="sm" className="me-2">
                                                <FaEye />
                                            </Button>
                                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(pkg)}>
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(pkg.id)}>
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

            {/* Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingPackage?.title ? 'Edit Package' : 'Add New Package'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Tabs defaultActiveKey="basic" className="mb-3">
                            <Tab eventKey="basic" title="Basic Info">
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title *</Form.Label>
                                            <Form.Control
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Location *</Form.Label>
                                            <Form.Control
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Price (LKR) *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Duration *</Form.Label>
                                            <Form.Control
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                placeholder="e.g., 3 Days"
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
                                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Main Image URL</Form.Label>
                                    <Form.Control
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="/path/to/image.jpg"
                                    />
                                </Form.Group>
                            </Tab>

                            <Tab eventKey="details" title="Details">
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Transport Details</Form.Label>
                                            <Form.Control
                                                value={formData.transport}
                                                onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                                                placeholder="e.g. Private AC Car"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Food/Meals</Form.Label>
                                            <Form.Control
                                                value={formData.food}
                                                onChange={(e) => setFormData({ ...formData, food: e.target.value })}
                                                placeholder="e.g. Breakfast included"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Map Location URL (Link)</Form.Label>
                                    <Form.Control
                                        value={formData.mapLocation}
                                        onChange={(e) => setFormData({ ...formData, mapLocation: e.target.value })}
                                        placeholder="Location name for map"
                                    />
                                </Form.Group>
                            </Tab>

                            <Tab eventKey="lists" title="Included & Gallery">
                                <Form.Group className="mb-3">
                                    <Form.Label>Included Items (One per line)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        value={formData.included ? formData.included.join('\n') : ''}
                                        onChange={(e) => setFormData({ ...formData, included: e.target.value.split('\n') })}
                                        placeholder="Airport pickup&#13;&#10;Breakfast&#13;&#10;Tickets"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Gallery Images (One URL per line)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        value={formData.gallery ? formData.gallery.join('\n') : ''}
                                        onChange={(e) => setFormData({ ...formData, gallery: e.target.value.split('\n') })}
                                        placeholder="image1.jpg&#13;&#10;image2.jpg"
                                    />
                                </Form.Group>
                            </Tab>

                            <Tab eventKey="hotels" title="Hotels">
                                <div className="alert alert-info small">
                                    Enter hotels as a JSON structure. Example:
                                    <pre>
                                        {`[
  {
    "name": "Hotel Name",
    "type": "Luxury",
    "description": "Hotel description",
    "image": "/path/to/image.jpg"
  }
]`}
                                    </pre>
                                </div>
                                <Form.Group className="mb-3">
                                    <Form.Label>Hotels JSON Data</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={10}
                                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                        value={typeof formData.hotels === 'string' ? formData.hotels : JSON.stringify(formData.hotels, null, 2)}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, hotels: val });
                                            try {
                                                JSON.parse(val);
                                                setJsonError(''); // Valid JSON
                                            } catch (err) {
                                                setJsonError('Invalid JSON format');
                                            }
                                        }}
                                    />
                                    {jsonError && <div className="text-danger small mt-1">{jsonError}</div>}
                                </Form.Group>
                            </Tab>
                        </Tabs>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Package
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PackageManagement;
