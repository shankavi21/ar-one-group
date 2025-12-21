import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, NavDropdown, Badge, Button } from 'react-bootstrap';
import { FaTachometerAlt, FaCalendarAlt, FaClipboardList, FaUserAlt, FaWallet, FaStar, FaBell, FaSignOutAlt, FaBars, FaCheck } from 'react-icons/fa';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { getGuideNotifications, markNotificationAsRead } from '../../services/firestoreService';

const GuideLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);
    const [guideName, setGuideName] = useState('Guide');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const storedName = localStorage.getItem('guideName');
        const guideId = localStorage.getItem('guideId');
        if (storedName) setGuideName(storedName);

        if (guideId) {
            const unsubscribe = getGuideNotifications(guideId, (data) => {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            });
            return () => unsubscribe();
        }
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('guideName');
            localStorage.removeItem('guideId');
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const sidebarItems = [
        { path: '/guide/', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { path: '/guide/bookings', icon: <FaClipboardList />, label: 'My Bookings' },
        { path: '/guide/calendar', icon: <FaCalendarAlt />, label: 'Availability' },
        { path: '/guide/earnings', icon: <FaWallet />, label: 'Earnings' },
        { path: '/guide/reviews', icon: <FaStar />, label: 'Reviews' },
        { path: '/guide/profile', icon: <FaUserAlt />, label: 'Profile' }
    ];

    return (
        <div className="guide-layout">
            <style>{`
                .guide-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f8f9fa;
                }
                .guide-sidebar {
                    width: 250px;
                    background: #1a1a1a;
                    color: white;
                    transition: all 0.3s;
                    position: fixed;
                    height: 100vh;
                    z-index: 1000;
                }
                .guide-sidebar .nav-link {
                    color: #adb5bd;
                    padding: 12px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.2s;
                    border-radius: 0;
                    border-left: 4px solid transparent;
                }
                .guide-sidebar .nav-link:hover, .guide-sidebar .nav-link.active {
                    color: white;
                    background: rgba(255,255,255,0.05);
                    border-left-color: #ffc107;
                }
                .guide-main {
                    flex: 1;
                    margin-left: 250px;
                    width: calc(100% - 250px);
                }
                .guide-navbar {
                    padding: 0.5rem 1.5rem;
                    background: white !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                @media (max-width: 992px) {
                    .guide-sidebar {
                        margin-left: -250px;
                    }
                    .guide-sidebar.show {
                        margin-left: 0;
                    }
                    .guide-main {
                        margin-left: 0;
                        width: 100%;
                    }
                }
            `}</style>

            {/* Sidebar */}
            <div className={`guide-sidebar ${expanded ? 'show' : ''}`}>
                <div className="p-4 border-bottom border-secondary mb-3">
                    <h4 className="fw-bold text-center mb-0" style={{ color: '#ffc107' }}>AR ONE</h4>
                    <p className="text-muted text-center small mb-0">Guide Portal</p>
                </div>
                <Nav className="flex-column">
                    {sidebarItems.map(item => (
                        <Nav.Link
                            key={item.path}
                            as={Link}
                            to={item.path}
                            active={location.pathname === item.path}
                            onClick={() => setExpanded(false)}
                        >
                            {item.icon} {item.label}
                        </Nav.Link>
                    ))}
                    <div className="mt-auto border-top border-secondary">
                        <Nav.Link onClick={handleLogout} className="text-danger">
                            <FaSignOutAlt /> Logout
                        </Nav.Link>
                    </div>
                </Nav>
            </div>

            {/* Main Content */}
            <div className="guide-main">
                <Navbar className="guide-navbar mb-4" expand="lg">
                    <Container fluid>
                        <Button
                            variant="link"
                            className="d-lg-none text-dark me-2"
                            onClick={() => setExpanded(!expanded)}
                        >
                            <FaBars />
                        </Button>
                        <Navbar.Brand className="fw-bold d-none d-lg-block">
                            Guide Dashboard
                        </Navbar.Brand>
                        <Nav className="ms-auto align-items-center">
                            <NavDropdown
                                id="notifications-dropdown"
                                align="end"
                                title={
                                    <div className="position-relative d-inline-block">
                                        <FaBell style={{ fontSize: '1.2rem' }} className="text-dark" />
                                        {unreadCount > 0 && (
                                            <Badge pill bg="danger" style={{
                                                fontSize: '0.6rem',
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                padding: '0.35em 0.5em'
                                            }}>
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                }
                            >
                                <div className="p-2 border-bottom fw-bold" style={{ width: '300px' }}>Notifications</div>
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {notifications.length > 0 ? (
                                        notifications.map(n => (
                                            <NavDropdown.Item
                                                key={n.id}
                                                className={`p-3 border-bottom ${!n.read ? 'bg-light' : ''}`}
                                                style={{ whiteSpace: 'normal' }}
                                                onClick={() => markNotificationAsRead(n.id)}
                                            >
                                                <div className="d-flex justify-content-between">
                                                    <small className="fw-bold">{n.title}</small>
                                                    {!n.read && <FaCheck className="text-muted small" />}
                                                </div>
                                                <p className="small mb-1 text-secondary">{n.message}</p>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>
                                                    {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                                </small>
                                            </NavDropdown.Item>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-muted small">No notifications</div>
                                    )}
                                </div>
                                <NavDropdown.Item className="text-center small text-primary p-2">View All Alerts</NavDropdown.Item>
                            </NavDropdown>

                            <div className="border-start mx-3" style={{ height: '30px' }}></div>

                            <NavDropdown
                                title={
                                    <div className="d-inline-flex align-items-center">
                                        <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                                            <FaUserAlt size={14} />
                                        </div>
                                        <span className="fw-medium">{guideName}</span>
                                    </div>
                                }
                                id="guide-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item as={Link} to="/guide/profile">Profile Settings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Container>
                </Navbar>

                <Container fluid className="px-4 pb-4">
                    <Outlet />
                </Container>
            </div>
        </div>
    );
};

export default GuideLayout;
