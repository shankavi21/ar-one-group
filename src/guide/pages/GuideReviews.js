import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { FaStar, FaQuoteLeft, FaUserCircle } from 'react-icons/fa';
import { getGuideReviews, getGuideByUid } from '../../services/firestoreService';
import { auth } from '../../firebase';

const GuideReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        average: 0,
        count: 0,
        distribution: [0, 0, 0, 0, 0] // 1-5 stars
    });

    useEffect(() => {
        const fetchReviews = async () => {
            const user = auth.currentUser;
            if (user) {
                const guideData = await getGuideByUid(user.uid);
                if (guideData) {
                    const data = await getGuideReviews(guideData.id, false);
                    setReviews(data);

                    if (data.length > 0) {
                        const total = data.reduce((sum, r) => sum + r.rating, 0);
                        const dist = [0, 0, 0, 0, 0];
                        data.forEach(r => dist[Math.floor(r.rating) - 1]++);

                        setStats({
                            average: (total / data.length).toFixed(1),
                            count: data.length,
                            distribution: dist.reverse() // 5 to 1
                        });
                    }
                }
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="guide-reviews">
            <h2 className="fw-bold mb-4">Customer Reviews</h2>

            <Row className="g-4 mb-5">
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-center h-100">
                        <Card.Body className="d-flex flex-column justify-content-center p-4">
                            <h1 className="display-3 fw-bold text-warning mb-0">{stats.average}</h1>
                            <div className="mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < Math.round(stats.average) ? 'text-warning' : 'text-light'} />
                                ))}
                            </div>
                            <p className="text-muted">Based on {stats.count} reviews</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4">Rating Distribution</h5>
                            {stats.distribution.map((count, i) => (
                                <div key={i} className="d-flex align-items-center mb-2">
                                    <span style={{ width: '50px' }} className="small fw-medium">{5 - i} Stars</span>
                                    <ProgressBar
                                        now={stats.count ? (count / stats.count) * 100 : 0}
                                        variant="warning"
                                        className="flex-grow-1 mx-3"
                                        style={{ height: '8px' }}
                                    />
                                    <span style={{ width: '30px' }} className="small text-muted text-end">{count}</span>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h5 className="fw-bold mb-4">Latest Feedback</h5>
            <Row xs={1} md={2} className="g-4">
                {reviews.map((review) => (
                    <Col key={review.id}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaUserCircle size={40} className="text-muted me-3" />
                                        <div>
                                            <h6 className="fw-bold mb-0">{review.userName || 'Anonymous'}</h6>
                                            <small className="text-muted">
                                                {review.createdAt?.seconds
                                                    ? new Date(review.createdAt.seconds * 1000).toDateString()
                                                    : (review.date ? new Date(review.date).toDateString() : 'Pending...')}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="text-warning mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={i < review.rating ? 'text-warning' : 'text-light'} />
                                            ))}
                                        </div>
                                        <Badge bg={review.status === 'approved' ? 'success' : (review.status === 'rejected' ? 'danger' : 'warning')}>
                                            {review.status || 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="position-relative">
                                    <FaQuoteLeft className="text-warning opacity-25 position-absolute top-0 start-0" size={20} style={{ margin: '-10px 0 0 -10px' }} />
                                    <p className="mb-0 text-muted ps-3 py-2 italic">{review.comment}</p>
                                </div>
                                {(review.packageName || review.packageTitle) && (
                                    <Badge bg="light" text="dark" className="mt-3 border">
                                        Tour: {review.packageName || review.packageTitle}
                                    </Badge>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                {reviews.length === 0 && (
                    <Col className="w-100 text-center py-5">
                        <p className="text-muted">No reviews found yet.</p>
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default GuideReviews;
