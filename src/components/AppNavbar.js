import React from 'react';
import { Navbar, Container, Nav, Button, Dropdown, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const AppNavbar = ({ transparent = false, user = null }) => {
    const navigate = useNavigate();

    const { userProfile } = useApp();

    // Use derive values instead of state to avoid synchronization issues (Scoped to UID)
    const displayName = user?.uid ? (localStorage.getItem(`userDisplayName_${user.uid}`) || userProfile?.name || user?.displayName || 'User') : 'User';
    const photoURL = user?.uid ? (localStorage.getItem(`userPhotoURL_${user.uid}`) || userProfile?.photoURL || user?.photoURL) : null;

    // Force re-render when localStorage changes
    const [, setTick] = useState(0);
    useEffect(() => {
        const handleStorageUpdate = () => setTick(t => t + 1);
        window.addEventListener('local-storage-update', handleStorageUpdate);
        return () => window.removeEventListener('local-storage-update', handleStorageUpdate);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Clear ALL local storage for safety on logout
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <Navbar expand="lg" sticky="top" className="px-4 py-3 shadow-sm" style={{ backgroundColor: '#0891b2' }} variant="dark">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 me-5">Ar One</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {user ? (
                        <>
                            <Nav className="mx-auto">
                                <Nav.Link as={Link} to="/home" className="text-white px-3 fw-medium">Home</Nav.Link>
                                <Nav.Link as={Link} to="/packages" className="text-white px-3 fw-medium">Packages</Nav.Link>
                                <Nav.Link as={Link} to="/guides" className="text-white px-3 fw-medium">Guides</Nav.Link>
                                <Nav.Link as={Link} to="/saved-trips" className="text-white px-3 fw-medium">Saved Trips</Nav.Link>
                                <Nav.Link as={Link} to="/my-bookings" className="text-white px-3 fw-medium">My Bookings</Nav.Link>
                                <Nav.Link as={Link} to="/contact" className="text-white px-3 fw-medium">Contact</Nav.Link>
                            </Nav>
                            <Nav className="align-items-center gap-3">
                                <div className="d-flex align-items-center text-white">
                                    <span className="me-2 d-none d-lg-block">Welcome {displayName}</span>
                                    <Dropdown align="end">
                                        <Dropdown.Toggle variant="link" className="p-0 text-white border-0 shadow-none" id="dropdown-user">
                                            {photoURL ? (
                                                <Image src={photoURL} roundedCircle width="32" height="32" className="border border-white" style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <FaUserCircle size={28} />
                                            )}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={handleLogout} className="text-danger">Logout</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </Nav>
                        </>
                    ) : (
                        <Nav className="ms-auto">
                            <Nav.Link as={Link} to="/login" className="text-white fw-semibold mx-2">Login</Nav.Link>
                            <Button as={Link} to="/register" variant="light" className="fw-bold text-primary-custom rounded-pill px-4">Register</Button>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;
