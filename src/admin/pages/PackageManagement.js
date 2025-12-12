import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge, InputGroup, Row, Col } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';

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
        included: []
    });

    useEffect(() => {
        loadPackages();
    }, []);

    useEffect(() => {
        filterPackages();
    }, [searchTerm, packages]);

    const loadPackages = () => {
        // Load packages (currently hardcoded in pages)
        const packagesData = [
            { id: 1, title: 'Sigiriya Adventure', location: 'Sigiriya, Sri Lanka', price: 45000, duration: '3 Days', image: '/sigiriya.png', rating: 4.8, status: 'active' },
            { id: 2, title: 'Ella Hill Climb', location: 'Ella, Sri Lanka', price: 35000, duration: '2 Days', image: '/ella.png', rating: 4.9, status: 'active' },
            { id: 3, title: 'Coastal Bliss', location: 'Mirissa, Sri Lanka', price: 60000, duration: '4 Days', image: '/beach.png', rating: 4.7, status: 'active' },
            { id: 4, title: 'Cultural Triangle', location: 'Kandy, Sri Lanka', price: 55000, duration: '3 Days', image: '/kandy.jpg', rating: 4.6, status: 'active' },
            { id: 5, title: 'Wild Yala Safari', location: 'Yala, Sri Lanka', price: 40000, duration: '2 Days', image: '/yala.jpg', rating: 4.8, status: 'active' },
            { id: 6, title: 'Historic Galle Fort', location: 'Galle, Sri Lanka', price: 30000, duration: '1 Day', image: '/galle.jpg', rating: 4.9, status: 'active' },
            { id: 7, title: 'Knuckles Trek', location: 'Matale, Sri Lanka', price: 50000, duration: '3 Days', image: '/knuckles.jpg', rating: 4.7, status: 'active' },
            { id: 8, title: 'Jaffna Discovery', location: 'Jaffna, Sri Lanka', price: 65000, duration: '4 Days', image: '/jaffna.jpg', rating: 4.5, status: 'active' },
        ];
        setPackages(packagesData);
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
            included: pkg.included || []
        });
        setShowModal(true);
    };

    const handleSave = () => {
        // In real app, save to Firestore
        const updatedPackages = packages.map(pkg =>
            pkg.id === editingPackage.id ? { ...pkg, ...formData } : pkg
        );
        setPackages(updatedPackages);
        setShowModal(false);
        setEditingPackage(null);
        alert('Package updated successfully!');
    };

    const handleDelete = (packageId) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            const updatedPackages = packages.filter(pkg => pkg.id !== packageId);
            setPackages(updatedPackages);
            alert('Package deleted successfully!');
        }
    };

    const handleAddNew = () => {
        setEditingPackage({ id: Date.now() }); // New package with temp ID
        setFormData({
            title: '',
            location: '',
            price: '',
            duration: '',
            description: '',
            image: '',
            rating: 4.5,
            included: []
        });
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
                                LKR {Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length).toLocaleString()}
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
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="/path/to/image.jpg"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>
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
