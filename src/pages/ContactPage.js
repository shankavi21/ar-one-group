import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { auth } from '../firebase';

const ContactPage = () => {
    const user = auth.currentUser;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Save to localStorage (in production, this would be sent to a server)
        const contactMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const newMessage = {
            ...formData,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        contactMessages.push(newMessage);
        localStorage.setItem('contactMessages', JSON.stringify(contactMessages));

        // Show success message
        setSubmitted(true);

        // Reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });

        // Hide success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <>
            <AppNavbar user={user} />

            <div style={{ paddingTop: '80px', paddingBottom: '60px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
                <Container>
                    {/* Header */}
                    <div className="text-center mb-5">
                        <h1 className="fw-bold mb-3" style={{ color: '#0891b2', fontSize: '3rem' }}>Get in Touch</h1>
                        <p className="text-muted fs-5">We'd love to hear from you! Send us a message and we'll respond as soon as possible.</p>
                    </div>

                    <Row className="g-4">
                        {/* Contact Form */}
                        <Col lg={7}>
                            <Card className="border-0 shadow-sm rounded-4 p-4">
                                <h3 className="fw-bold mb-4" style={{ color: '#1f2937' }}>Send Us a Message</h3>

                                {submitted && (
                                    <div className="alert alert-success d-flex align-items-center rounded-3 mb-4">
                                        <span className="me-2" style={{ fontSize: '24px' }}>✅</span>
                                        <div>
                                            <strong>Message Sent Successfully!</strong>
                                            <p className="mb-0 small">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                                        </div>
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">Your Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="John Doe"
                                                    className="p-3 border-2"
                                                    style={{ borderRadius: '10px' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">Email Address *</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="john@example.com"
                                                    className="p-3 border-2"
                                                    style={{ borderRadius: '10px' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">Phone Number</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+94 XX XXX XXXX"
                                                    className="p-3 border-2"
                                                    style={{ borderRadius: '10px' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">Subject *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="How can we help?"
                                                    className="p-3 border-2"
                                                    style={{ borderRadius: '10px' }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">Message *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={6}
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            placeholder="Tell us more about your inquiry..."
                                            className="p-3 border-2"
                                            style={{ borderRadius: '10px' }}
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="fw-bold px-5 py-3 rounded-pill shadow-sm w-100"
                                        style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', border: 'none', fontSize: '16px' }}
                                    >
                                        Send Message
                                    </Button>
                                </Form>
                            </Card>
                        </Col>

                        {/* Contact Information */}
                        <Col lg={5}>
                            <div className="h-100 d-flex flex-column gap-4">
                                {/* Contact Details Card */}
                                <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', color: 'white' }}>
                                    <h4 className="fw-bold mb-4">Contact Information</h4>

                                    <div className="mb-4">
                                        <div className="d-flex align-items-start mb-3">
                                            <FaMapMarkerAlt size={24} className="me-3 mt-1" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Address</h6>
                                                <p className="mb-0">123 Galle Road, Colombo 03<br />Sri Lanka</p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-start mb-3">
                                            <FaPhone size={24} className="me-3 mt-1" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Phone</h6>
                                                <p className="mb-0">+94 11 234 5678<br />+94 77 123 4567</p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-start mb-3">
                                            <FaEnvelope size={24} className="me-3 mt-1" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Email</h6>
                                                <p className="mb-0">info@arone.lk<br />support@arone.lk</p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-start">
                                            <FaClock size={24} className="me-3 mt-1" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Working Hours</h6>
                                                <p className="mb-0">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />

                                    <div>
                                        <h6 className="fw-bold mb-3">Follow Us</h6>
                                        <div className="d-flex gap-3">
                                            <a href="#" className="text-white" style={{ fontSize: '24px' }}><FaFacebook /></a>
                                            <a href="#" className="text-white" style={{ fontSize: '24px' }}><FaTwitter /></a>
                                            <a href="#" className="text-white" style={{ fontSize: '24px' }}><FaInstagram /></a>
                                            <a href="#" className="text-white" style={{ fontSize: '24px' }}><FaLinkedin /></a>
                                        </div>
                                    </div>
                                </Card>

                                {/* Map Card */}
                                <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ height: '300px' }}>
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.58804085277!2d79.77380045!3d6.927078599999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="AR One Location"
                                    ></iframe>
                                </Card>
                            </div>
                        </Col>
                    </Row>

                    {/* FAQ Section */}
                    <div className="mt-5 pt-5">
                        <h3 className="fw-bold text-center mb-5" style={{ color: '#0891b2' }}>Frequently Asked Questions</h3>
                        <Row className="g-4">
                            <Col md={6}>
                                <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                                    <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>How do I book a tour?</h5>
                                    <p className="text-muted mb-0">Simply browse our packages, select your preferred tour, fill in the booking details, choose your guide and hotel, and complete the payment. You'll receive a confirmation email immediately.</p>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                                    <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>Can I cancel my booking?</h5>
                                    <p className="text-muted mb-0">Yes, you can cancel your booking up to 48 hours before the tour starts for a full refund. Cancellations made within 48 hours are subject to a 50% cancellation fee.</p>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                                    <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>Are your guides certified?</h5>
                                    <p className="text-muted mb-0">All our guides are professionally trained and certified by the Sri Lanka Tourism Development Authority. They have extensive local knowledge and years of experience.</p>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="border-0 shadow-sm rounded-4 p-4 h-100">
                                    <h5 className="fw-bold mb-3" style={{ color: '#1f2937' }}>What payment methods do you accept?</h5>
                                    <p className="text-muted mb-0">We accept all major credit cards, debit cards, PayPal, and bank transfers. All payments are processed through secure, encrypted payment gateways.</p>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>

            <Footer />
        </>
    );
};

export default ContactPage;
