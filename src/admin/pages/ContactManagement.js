import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FaEnvelope, FaCheck, FaTrash, FaEye } from 'react-icons/fa';

import { getAllContacts, updateContactStatus, deleteContact } from '../../services/firestoreService';

const ContactManagement = () => {
    const [contacts, setContacts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const data = await getAllContacts();
            setContacts(data);
        } catch (error) {
            console.error("Failed to load contacts", error);
        }
    };

    const handleMarkResolved = async (id) => {
        try {
            await updateContactStatus(id, 'resolved');
            loadContacts();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this message?')) {
            try {
                await deleteContact(id);
                loadContacts();
            } catch (error) {
                console.error("Error deleting contact", error);
            }
        }
    };

    return (
        <div>
            <h2 className="fw-bold mb-4">Contact Inquiries</h2>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table hover responsive>
                        <thead className="bg-light">
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length > 0 ? contacts.map(contact => (
                                <tr key={contact.id}>
                                    <td>{contact.name}</td>
                                    <td>{contact.email}</td>
                                    <td>{contact.subject}</td>
                                    <td>{new Date(contact.timestamp).toLocaleDateString()}</td>
                                    <td>
                                        <Badge bg={contact.status === 'resolved' ? 'success' : 'warning'}>
                                            {contact.status || 'pending'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button variant="outline-info" size="sm" className="me-2" onClick={() => { setSelectedContact(contact); setShowModal(true); }}>
                                            <FaEye />
                                        </Button>
                                        {contact.status !== 'resolved' && (
                                            <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleMarkResolved(contact.id)}>
                                                <FaCheck />
                                            </Button>
                                        )}
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(contact.id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center">No contacts</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>Contact Details</Modal.Title></Modal.Header>
                <Modal.Body>
                    {selectedContact && (
                        <div>
                            <p><strong>Name:</strong> {selectedContact.name}</p>
                            <p><strong>Email:</strong> {selectedContact.email}</p>
                            <p><strong>Phone:</strong> {selectedContact.phone}</p>
                            <p><strong>Subject:</strong> {selectedContact.subject}</p>
                            <p><strong>Message:</strong></p>
                            <p>{selectedContact.message}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ContactManagement;
