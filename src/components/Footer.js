import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-5 mt-auto">
            <Container>
                <Row>
                    <Col md={4} className="mb-4">
                        <h5 className="fw-bold mb-3">Ar One</h5>
                        <p className="text-secondary small">
                            Discover the wonder of Sri Lanka with our expert guides and curated packages.
                            Your journey to the pearl of the Indian Ocean starts here.
                        </p>
                    </Col>
                    <Col md={2} className="mb-4">
                        <h6 className="fw-bold mb-3">Quick Links</h6>
                        <ul className="list-unstyled small text-secondary">
                            <li className="mb-2"><a href="/home" className="text-decoration-none text-secondary">Home</a></li>
                            <li className="mb-2"><a href="/packages" className="text-decoration-none text-secondary">Packages</a></li>
                            <li className="mb-2"><a href="/guides" className="text-decoration-none text-secondary">Guides</a></li>
                            <li className="mb-2"><a href="/contact" className="text-decoration-none text-secondary">Contact</a></li>
                        </ul>
                    </Col>
                    <Col md={3} className="mb-4">
                        <h6 className="fw-bold mb-3">Contact Us</h6>
                        <ul className="list-unstyled small text-secondary">
                            <li className="mb-2">123 Tourism Way, Colombo</li>
                            <li className="mb-2">+94 77 123 4567</li>
                            <li className="mb-2">info@arone.com</li>
                        </ul>
                    </Col>
                    <Col md={3} className="mb-4">
                        <h6 className="fw-bold mb-3">Follow Us</h6>
                        <div className="d-flex gap-3">
                            <FaFacebook className="text-secondary fs-5 cursor-pointer" />
                            <FaTwitter className="text-secondary fs-5 cursor-pointer" />
                            <FaInstagram className="text-secondary fs-5 cursor-pointer" />
                            <FaLinkedin className="text-secondary fs-5 cursor-pointer" />
                        </div>
                    </Col>
                </Row>
                <hr className="border-secondary my-4" />
                <div className="text-center text-secondary small">
                    &copy; {new Date().getFullYear()} Ar One Tourism. All rights reserved.
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
