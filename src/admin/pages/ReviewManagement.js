import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaStar, FaCheck, FaTimes, FaTrash, FaEye, FaEdit } from 'react-icons/fa';

import { getAllReviews, updateReviewStatus, deleteReview, updateReview } from '../../services/firestoreService';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedComment, setEditedComment] = useState('');

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const data = await getAllReviews();
            setReviews(data);
        } catch (error) {
            console.error("Failed to load reviews", error);
        }
    };

    const handleStatusChange = async (reviewId, newStatus) => {
        try {
            await updateReviewStatus(reviewId, newStatus);
            loadReviews();
            alert(`Review ${newStatus}!`);
        } catch (error) {
            console.error("Error updating review status", error);
            alert("Failed to update status");
        }
    };

    const handleDelete = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await deleteReview(reviewId);
                loadReviews();
                alert('Review deleted successfully!');
            } catch (error) {
                console.error("Error deleting review", error);
                alert("Failed to delete review");
            }
        }
    };

    const handleEdit = async () => {
        try {
            await updateReview(selectedReview.id, { comment: editedComment });
            loadReviews();
            setEditMode(false);
            setShowModal(false);
            alert('Review updated successfully!');
        } catch (error) {
            console.error("Error updating review", error);
            alert("Failed to update review");
        }
    };

    const handleViewDetails = (review) => {
        setSelectedReview(review);
        setEditedComment(review.comment);
        setEditMode(false);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const variants = {
            approved: 'success',
            pending: 'warning',
            rejected: 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status?.toUpperCase()}</Badge>;
    };

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, idx) => (
            <FaStar
                key={idx}
                className={idx < rating ? 'text-warning' : 'text-muted'}
            />
        ));
    };

    const filteredReviews = filterStatus === 'all'
        ? reviews
        : reviews.filter(r => r.status === filterStatus);

    const stats = {
        total: reviews.length,
        approved: reviews.filter(r => r.status === 'approved').length,
        pending: reviews.filter(r => r.status === 'pending').length,
        rejected: reviews.filter(r => r.status === 'rejected').length,
        avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    };

    return (
        <div>
            <h2 className="fw-bold mb-4">Review Management</h2>

            {/* Stats */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 small">Total Reviews</p>
                            <h3 className="fw-bold mb-0">{stats.total}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 small">Approved</p>
                            <h3 className="fw-bold mb-0 text-success">{stats.approved}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 small">Pending</p>
                            <h3 className="fw-bold mb-0 text-warning">{stats.pending}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <p className="text-muted mb-1 small">Avg Rating</p>
                            <h3 className="fw-bold mb-0 text-primary">
                                <FaStar className="text-warning" /> {stats.avgRating}
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filter */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Reviews</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </Form.Select>
                </Card.Body>
            </Card>

            {/* Reviews Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>User</th>
                                    <th>Package/Guide</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReviews.length > 0 ? (
                                    filteredReviews.map(review => (
                                        <tr key={review.id}>
                                            <td>
                                                <div className="fw-medium">{review.userName}</div>
                                                <small className="text-muted">{review.userEmail}</small>
                                            </td>
                                            <td>
                                                {review.packageName && <span className="badge bg-primary">{review.packageName}</span>}
                                                {review.guideName && <span className="badge bg-info">{review.guideName}</span>}
                                            </td>
                                            <td>
                                                <div>{renderStars(review.rating)}</div>
                                                <small>{review.rating}/5</small>
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '300px' }}>
                                                    {review.comment.substring(0, 80)}
                                                    {review.comment.length > 80 && '...'}
                                                </div>
                                            </td>
                                            <td>{new Date(review.date).toLocaleDateString()}</td>
                                            <td>{getStatusBadge(review.status)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleViewDetails(review)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                {review.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            className="me-1"
                                                            onClick={() => handleStatusChange(review.id, 'approved')}
                                                        >
                                                            <FaCheck />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="me-1"
                                                            onClick={() => handleStatusChange(review.id, 'rejected')}
                                                        >
                                                            <FaTimes />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(review.id)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            No reviews found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Review Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Review Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <p><strong>User:</strong> {selectedReview.userName}</p>
                                    <p><strong>Email:</strong> {selectedReview.userEmail}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Date:</strong> {new Date(selectedReview.date).toLocaleString()}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedReview.status)}</p>
                                </Col>
                            </Row>
                            <hr />
                            <p><strong>For:</strong> {selectedReview.packageName || selectedReview.guideName}</p>
                            <p><strong>Rating:</strong> {renderStars(selectedReview.rating)} ({selectedReview.rating}/5)</p>
                            <hr />
                            <p><strong>Comment:</strong></p>
                            {editMode ? (
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={editedComment}
                                    onChange={(e) => setEditedComment(e.target.value)}
                                />
                            ) : (
                                <p className="p-3 bg-light rounded">{selectedReview.comment}</p>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {editMode ? (
                        <>
                            <Button variant="secondary" onClick={() => setEditMode(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleEdit}>
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline-primary" onClick={() => setEditMode(true)}>
                                <FaEdit className="me-1" /> Edit Comment
                            </Button>
                            {selectedReview?.status === 'pending' && (
                                <>
                                    <Button variant="success" onClick={() => { handleStatusChange(selectedReview.id, 'approved'); setShowModal(false); }}>
                                        <FaCheck className="me-1" /> Approve
                                    </Button>
                                    <Button variant="danger" onClick={() => { handleStatusChange(selectedReview.id, 'rejected'); setShowModal(false); }}>
                                        <FaTimes className="me-1" /> Reject
                                    </Button>
                                </>
                            )}
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Close
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReviewManagement;
