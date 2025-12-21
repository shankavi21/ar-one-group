import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Image, Badge } from 'react-bootstrap';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLanguage, FaStar, FaSave, FaCamera } from 'react-icons/fa';
import { getGuideByUid, updateGuide } from '../../services/firestoreService';
import { auth } from '../../firebase';

const GuideProfile = () => {
    const [loading, setLoading] = useState(true);
    const [guide, setGuide] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        languages: [],
        experience: '',
        image: ''
    });

    useEffect(() => {
        const fetchGuide = async () => {
            const user = auth.currentUser;
            if (user) {
                const data = await getGuideByUid(user.uid);
                if (data) {
                    setGuide(data);
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        location: data.location || '',
                        bio: data.bio || '',
                        languages: data.languages || [],
                        experience: data.experience || '',
                        image: data.image || ''
                    });
                }
            }
            setLoading(false);
        };
        fetchGuide();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLanguageToggle = (lang) => {
        const current = formData.languages || [];
        if (current.includes(lang)) {
            setFormData(prev => ({ ...prev, languages: current.filter(l => l !== lang) }));
        } else {
            setFormData(prev => ({ ...prev, languages: [...current, lang] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateGuide(guide.id, formData);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile", error);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="guide-profile">
            <h2 className="fw-bold mb-4">My Profile</h2>

            <Row>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4 text-center">
                        <Card.Body className="p-4">
                            <div className="position-relative d-inline-block mb-3">
                                <Image
                                    src={formData.image || 'https://via.placeholder.com/150'}
                                    roundedCircle
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    className="border border-4 border-warning"
                                />
                                <Button
                                    variant="warning"
                                    size="sm"
                                    className="position-absolute bottom-0 end-0 rounded-circle"
                                    onClick={() => {
                                        const url = prompt("Enter new image URL:");
                                        if (url) setFormData({ ...formData, image: url });
                                    }}
                                >
                                    <FaCamera />
                                </Button>
                            </div>
                            <h4 className="fw-bold mb-1">{formData.name}</h4>
                            <p className="text-muted mb-3">{guide?.role || 'Professional Guide'}</p>

                            <div className="d-flex justify-content-center gap-2 mb-4">
                                <Badge bg="warning" text="dark" className="px-3 py-2">
                                    <FaStar className="me-1" /> {guide?.rating || 'NEW'}
                                </Badge>
                                <Badge bg="light" text="dark" className="px-3 py-2 border">
                                    {guide?.experience || 'Experience not set'}
                                </Badge>
                            </div>

                            <hr />

                            <div className="text-start">
                                <div className="mb-2">
                                    <FaEnvelope className="text-muted me-2" />
                                    <span className="small">{formData.email}</span>
                                </div>
                                <div className="mb-2">
                                    <FaPhone className="text-muted me-2" />
                                    <span className="small">{formData.phone}</span>
                                </div>
                                <div className="mb-0">
                                    <FaMapMarkerAlt className="text-muted me-2" />
                                    <span className="small">{formData.location}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Public View</h5>
                            <p className="small text-muted mb-3">This is how customers see you on the platform.</p>
                            <Button variant="outline-primary" size="sm" className="w-100" onClick={() => window.open(`/guides/${guide.id}`, '_blank')}>
                                Preview Public Profile
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0 fw-bold">Edit Profile Details</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Name</Form.Label>
                                            <Form.Control
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Experience</Form.Label>
                                            <Form.Control
                                                name="experience"
                                                placeholder="e.g. 5 Years"
                                                value={formData.experience}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone Number</Form.Label>
                                            <Form.Control
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Location</Form.Label>
                                            <Form.Control
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Bio / About You</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Languages You Speak</Form.Label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {['English', 'Sinhala', 'Tamil', 'German', 'French', 'Chinese', 'Japanese', 'Russian'].map(lang => (
                                            <Button
                                                key={lang}
                                                size="sm"
                                                variant={formData.languages?.includes(lang) ? 'primary' : 'outline-secondary'}
                                                onClick={() => handleLanguageToggle(lang)}
                                            >
                                                {lang}
                                            </Button>
                                        ))}
                                    </div>
                                </Form.Group>

                                <hr className="my-4" />

                                <div className="d-flex justify-content-end">
                                    <Button variant="warning" type="submit" className="fw-bold px-4">
                                        <FaSave className="me-2" /> Save Changes
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default GuideProfile;
