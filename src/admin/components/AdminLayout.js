import React, { useState } from 'react';
import { Container, Row, Col, Nav, Navbar, Dropdown, Image } from 'react-bootstrap';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaBox, FaUserTie, FaCalendarCheck, FaEnvelope, FaStar, FaCog, FaChartBar, FaSignOutAlt, FaBars, FaTags, FaWallet } from 'react-icons/fa';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const user = auth.currentUser;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const menuItems = [
        { path: '/admin', icon: FaHome, label: 'Dashboard' },
        { path: '/admin/users', icon: FaUsers, label: 'Users' },
        { path: '/admin/packages', icon: FaBox, label: 'Packages' },
        { path: '/admin/guides', icon: FaUserTie, label: 'Guides' },
        { path: '/admin/bookings', icon: FaCalendarCheck, label: 'Bookings' },
        { path: '/admin/contacts', icon: FaEnvelope, label: 'Contacts' },
        { path: '/admin/offers', icon: FaTags, label: 'Offers' },
        { path: '/admin/payouts', icon: FaWallet, label: 'Payouts' },
        { path: '/admin/reviews', icon: FaStar, label: 'Reviews' },
        { path: '/admin/settings', icon: FaCog, label: 'Settings' },
        { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar */}
            <div
                className={`bg-dark text-white ${sidebarOpen ? '' : 'd-none d-lg-block'}`}
                style={{
                    width: sidebarOpen ? '250px' : '0',
                    transition: 'all 0.3s',
                    position: 'fixed',
                    height: '100vh',
                    overflowY: 'auto',
                    zIndex: 1000
                }}
            >
                <div className="p-4">
                    <h4 className="fw-bold mb-4" style={{ color: '#0891b2' }}>
                        <FaBars className="me-2 cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)} />
                        Admin Panel
                    </h4>
                    <Nav className="flex-column">
                        {menuItems.map((item) => (
                            <Nav.Link
                                key={item.path}
                                as={Link}
                                to={item.path}
                                className={`text-white mb-2 rounded ${isActive(item.path) ? 'bg-primary' : ''}`}
                                style={{
                                    backgroundColor: isActive(item.path) ? '#0891b2' : 'transparent',
                                    padding: '10px 15px'
                                }}
                            >
                                <item.icon className="me-2" />
                                {item.label}
                            </Nav.Link>
                        ))}
                    </Nav>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: sidebarOpen ? '250px' : '0', transition: 'all 0.3s' }}>
                {/* Top Navbar */}
                <Navbar bg="white" className="shadow-sm px-4 py-3" style={{ borderBottom: '2px solid #0891b2' }}>
                    <div className="d-flex align-items-center">
                        <FaBars
                            className="me-3 cursor-pointer d-lg-none"
                            size={24}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        />
                        <h5 className="mb-0 fw-bold">AR One Tourism - Admin</h5>
                    </div>
                    <div className="ms-auto d-flex align-items-center gap-3">
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" className="text-dark text-decoration-none p-0">
                                <div className="d-flex align-items-center">
                                    <span className="me-2 d-none d-md-block">
                                        {user?.displayName || user?.email?.split('@')[0] || 'Admin'}
                                    </span>
                                    {user?.photoURL ? (
                                        <Image src={user.photoURL} roundedCircle width="32" height="32" />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px' }}
                                        >
                                            A
                                        </div>
                                    )}
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item as={Link} to="/">
                                    <FaHome className="me-2" /> Go to Website
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout} className="text-danger">
                                    <FaSignOutAlt className="me-2" /> Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Navbar>

                {/* Page Content */}
                <Container fluid className="p-4">
                    <Outlet />
                </Container>
            </div>
        </div>
    );
};

export default AdminLayout;
