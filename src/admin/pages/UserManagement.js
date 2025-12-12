import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Badge, InputGroup } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaUserShield } from 'react-icons/fa';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phone: '',
        bio: '',
        role: 'user'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, users]);

    const loadUsers = () => {
        // In a real app, you would fetch from Firebase Auth + Firestore
        // For now, we'll create mock data from localStorage
        const mockUsers = [
            {
                id: '1',
                displayName: localStorage.getItem('userDisplayName') || 'Demo User',
                email: 'demo@example.com',
                phone: localStorage.getItem('userPhone') || '+94 XX XXX XXXX',
                bio: localStorage.getItem('userBio') || 'No bio',
                role: 'admin',
                joinDate: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                status: 'active'
            }
        ];
        setUsers(mockUsers);
    };

    const filterUsers = () => {
        if (!searchTerm) {
            setFilteredUsers(users);
            return;
        }

        const filtered = users.filter(user =>
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm)
        );
        setFilteredUsers(filtered);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            displayName: user.displayName || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            role: user.role || 'user'
        });
        setShowModal(true);
    };

    const handleSave = () => {
        // In real app, update Firebase Auth + Firestore
        const updatedUsers = users.map(user =>
            user.id === editingUser.id ? { ...user, ...formData } : user
        );
        setUsers(updatedUsers);
        setShowModal(false);
        setEditingUser(null);
        alert('User updated successfully!');
    };

    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            alert('User deleted successfully!');
        }
    };

    const getRoleBadge = (role) => {
        return role === 'admin' ? (
            <Badge bg="danger">
                <FaUserShield className="me-1" /> Admin
            </Badge>
        ) : (
            <Badge bg="secondary">User</Badge>
        );
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">User Management</h2>
                <Button variant="primary" onClick={() => alert('Add new user functionality')}>
                    <FaPlus className="me-2" /> Add New User
                </Button>
            </div>

            {/* Search and Filter */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Card.Body>
            </Card>

            {/* Stats */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1">Total Users</p>
                            <h3 className="fw-bold mb-0">{users.length}</h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1">Active</p>
                            <h3 className="fw-bold mb-0 text-success">
                                {users.filter(u => u.status === 'active').length}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1">Admins</p>
                            <h3 className="fw-bold mb-0 text-danger">
                                {users.filter(u => u.role === 'admin').length}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Users Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Join Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="fw-medium">{user.displayName}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone}</td>
                                            <td>{getRoleBadge(user.role)}</td>
                                            <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                                            <td>
                                                <Badge bg={user.status === 'active' ? 'success' : 'secondary'}>
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Display Name</Form.Label>
                            <Form.Control
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement;
