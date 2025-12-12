import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Tabs, Image, Badge, Alert } from 'react-bootstrap';
import { FaUserEdit, FaLock, FaHistory, FaCog, FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import { auth } from '../firebase';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;
    const { currency, language, notifications, updateCurrency, updateLanguage, updateNotifications, formatPrice } = useApp();

    const [activeTab, setActiveTab] = useState('profile');
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile data
    const [profileData, setProfileData] = useState({
        displayName: localStorage.getItem('userDisplayName') || user?.displayName || '',
        email: user?.email || '',
        phone: localStorage.getItem('userPhone') || '',
        bio: localStorage.getItem('userBio') || '',
        photoURL: localStorage.getItem('userPhotoURL') || user?.photoURL || ''
    });

    // Original data backup for cancel functionality
    const [originalData, setOriginalData] = useState({ ...profileData });

    // Password data
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Settings data
    const [settings, setSettings] = useState({
        emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') || 'true'),
        smsNotifications: JSON.parse(localStorage.getItem('smsNotifications') || 'false'),
        newsletterSubscription: JSON.parse(localStorage.getItem('newsletterSubscription') || 'true'),
        bookingReminders: JSON.parse(localStorage.getItem('bookingReminders') || 'true'),
        currency: localStorage.getItem('currency') || 'LKR',
        language: localStorage.getItem('language') || 'English'
    });

    // Bookings
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Load custom user data from localStorage
        const customDisplayName = localStorage.getItem('userDisplayName');
        const customPhotoURL = localStorage.getItem('userPhotoURL');
        const customPhone = localStorage.getItem('userPhone');
        const customBio = localStorage.getItem('userBio');

        const loadedProfile = {
            displayName: customDisplayName || user?.displayName || '',
            email: user?.email || '',
            phone: customPhone || '',
            bio: customBio || '',
            photoURL: customPhotoURL || user?.photoURL || ''
        };

        setProfileData(loadedProfile);
        setOriginalData(loadedProfile);

        // Load bookings
        const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        setBookings(userBookings);
    }, [user, navigate]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleProfileUpdate = async () => {
        try {
            // Save to localStorage first (always works)
            localStorage.setItem('userDisplayName', profileData.displayName);
            localStorage.setItem('userPhone', profileData.phone);
            localStorage.setItem('userBio', profileData.bio);
            localStorage.setItem('userPhotoURL', profileData.photoURL);

            // Try to update Firebase profile (may fail in demo mode)
            try {
                if (user && !user.isAnonymous) {
                    await updateProfile(user, {
                        displayName: profileData.displayName,
                        photoURL: profileData.photoURL
                    });
                }
            } catch (firebaseError) {
                // Firebase update failed, but localStorage succeeded
                console.log('Firebase update skipped:', firebaseError.message);
            }

            // Update original data after successful save
            setOriginalData({ ...profileData });
            setEditing(false);
            showMessage('success', 'Profile updated successfully!');
        } catch (error) {
            showMessage('error', 'Failed to update profile: ' + error.message);
        }
    };

    const handleCancelEdit = () => {
        // Revert to original data
        setProfileData({ ...originalData });
        setEditing(false);
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('error', 'New passwords do not match!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showMessage('error', 'Password must be at least 6 characters!');
            return;
        }

        try {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(
                user.email,
                passwordData.currentPassword
            );
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, passwordData.newPassword);

            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showMessage('success', 'Password changed successfully!');
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                showMessage('error', 'Current password is incorrect!');
            } else {
                showMessage('error', 'Failed to change password: ' + error.message);
            }
        }
    };

    const handleSettingsSave = () => {
        // Save notification settings to localStorage
        localStorage.setItem('emailNotifications', settings.emailNotifications);
        localStorage.setItem('smsNotifications', settings.smsNotifications);
        localStorage.setItem('newsletterSubscription', settings.newsletterSubscription);
        localStorage.setItem('bookingReminders', settings.bookingReminders);

        // Update global context for currency and language (this triggers re-renders app-wide)
        updateCurrency(settings.currency);
        updateLanguage(settings.language);

        // Update notifications in context
        updateNotifications({
            emailNotifications: settings.emailNotifications,
            smsNotifications: settings.smsNotifications,
            newsletterSubscription: settings.newsletterSubscription,
            bookingReminders: settings.bookingReminders
        });

        showMessage('success', 'Settings saved successfully! Currency and language changes are now active.');
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData({ ...profileData, photoURL: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) return null;

    return (
        <>
            <AppNavbar user={user} />

            <div style={{ paddingTop: '80px', paddingBottom: '60px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
                <Container>
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="fw-bold mb-2" style={{ color: '#0891b2' }}>My Account</h1>
                        <p className="text-muted">Manage your profile, security, and preferences</p>
                    </div>

                    {/* Success/Error Messages */}
                    {message.text && (
                        <Alert variant={message.type === 'success' ? 'success' : 'danger'} className="mb-4">
                            {message.text}
                        </Alert>
                    )}

                    {/* Tabs */}
                    <Card className="border-0 shadow-sm rounded-4">
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                            className="px-4 pt-3"
                            style={{ borderBottom: '2px solid #e5e7eb' }}
                        >
                            {/* Profile Tab */}
                            <Tab eventKey="profile" title={<span><FaUserEdit className="me-2" />Profile</span>}>
                                <div className="p-4">
                                    <Row>
                                        <Col md={4} className="text-center mb-4">
                                            <div className="position-relative d-inline-block">
                                                <Image
                                                    src={profileData.photoURL || 'https://via.placeholder.com/150'}
                                                    roundedCircle
                                                    style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                                                />
                                                {editing && (
                                                    <label
                                                        className="position-absolute bottom-0 end-0 rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                        style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                                                    >
                                                        <FaCamera />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                            <h4 className="mt-3 fw-bold">{profileData.displayName || 'User'}</h4>
                                            <p className="text-muted">{user.email}</p>
                                            <Badge bg="success" className="px-3 py-2">Active Member</Badge>
                                        </Col>

                                        <Col md={8}>
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h5 className="fw-bold mb-0">Personal Information</h5>
                                                {!editing ? (
                                                    <Button variant="outline-primary" onClick={() => setEditing(true)} className="rounded-pill">
                                                        <FaUserEdit className="me-2" />Edit Profile
                                                    </Button>
                                                ) : (
                                                    <div className="d-flex gap-2">
                                                        <Button variant="success" onClick={handleProfileUpdate} className="rounded-pill">
                                                            <FaSave className="me-2" />Save
                                                        </Button>
                                                        <Button variant="outline-secondary" onClick={handleCancelEdit} className="rounded-pill">
                                                            <FaTimes className="me-2" />Cancel
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <Form>
                                                <Row>
                                                    <Col md={6} className="mb-3">
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">Full Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={profileData.displayName}
                                                                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                                                disabled={!editing}
                                                                className="p-3 border-2"
                                                                style={{ borderRadius: '10px' }}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6} className="mb-3">
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">Email Address</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                value={profileData.email}
                                                                disabled
                                                                className="p-3 border-2"
                                                                style={{ borderRadius: '10px', backgroundColor: '#f3f4f6' }}
                                                            />
                                                            <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6} className="mb-3">
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">Phone Number</Form.Label>
                                                            <Form.Control
                                                                type="tel"
                                                                value={profileData.phone}
                                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                                disabled={!editing}
                                                                placeholder="+94 XX XXX XXXX"
                                                                className="p-3 border-2"
                                                                style={{ borderRadius: '10px' }}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6} className="mb-3">
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">Member Since</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={new Date(user.metadata.creationTime).toLocaleDateString()}
                                                                disabled
                                                                className="p-3 border-2"
                                                                style={{ borderRadius: '10px', backgroundColor: '#f3f4f6' }}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Bio</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                        disabled={!editing}
                                                        placeholder="Tell us about yourself..."
                                                        className="p-3 border-2"
                                                        style={{ borderRadius: '10px' }}
                                                    />
                                                </Form.Group>
                                            </Form>
                                        </Col>
                                    </Row>
                                </div>
                            </Tab>

                            {/* Security Tab */}
                            <Tab eventKey="security" title={<span><FaLock className="me-2" />Security</span>}>
                                <div className="p-4">
                                    <h5 className="fw-bold mb-4">Change Password</h5>
                                    <Row>
                                        <Col md={6}>
                                            <Form>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Current Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        placeholder="Enter current password"
                                                        className="p-3 border-2"
                                                        style={{ borderRadius: '10px' }}
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">New Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        placeholder="Enter new password"
                                                        className="p-3 border-2"
                                                        style={{ borderRadius: '10px' }}
                                                    />
                                                    <Form.Text className="text-muted">Minimum 6 characters</Form.Text>
                                                </Form.Group>

                                                <Form.Group className="mb-4">
                                                    <Form.Label className="fw-semibold">Confirm New Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        placeholder="Confirm new password"
                                                        className="p-3 border-2"
                                                        style={{ borderRadius: '10px' }}
                                                    />
                                                </Form.Group>

                                                <Button
                                                    variant="primary"
                                                    onClick={handlePasswordChange}
                                                    className="fw-bold px-4 py-3 rounded-pill"
                                                    style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', border: 'none' }}
                                                >
                                                    <FaLock className="me-2" />Change Password
                                                </Button>
                                            </Form>
                                        </Col>
                                        <Col md={6}>
                                            <div className="bg-light p-4 rounded-4 h-100">
                                                <h6 className="fw-bold mb-3">Password Requirements</h6>
                                                <ul className="text-muted small">
                                                    <li>At least 6 characters long</li>
                                                    <li>Include uppercase and lowercase letters</li>
                                                    <li>Include at least one number</li>
                                                    <li>Avoid common passwords</li>
                                                </ul>
                                                <hr />
                                                <h6 className="fw-bold mb-3">Account Security</h6>
                                                <p className="text-muted small mb-2">
                                                    <strong>Last Login:</strong> {new Date(user.metadata.lastSignInTime).toLocaleString()}
                                                </p>
                                                <p className="text-muted small mb-0">
                                                    <strong>Account Created:</strong> {new Date(user.metadata.creationTime).toLocaleString()}
                                                </p>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Tab>

                            {/* Booking History Tab */}
                            <Tab eventKey="bookings" title={<span><FaHistory className="me-2" />Booking History</span>}>
                                <div className="p-4">
                                    <h5 className="fw-bold mb-4">My Bookings ({bookings.length})</h5>
                                    {bookings.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No bookings yet</p>
                                            <Button variant="primary" onClick={() => navigate('/packages')} className="rounded-pill">
                                                Browse Packages
                                            </Button>
                                        </div>
                                    ) : (
                                        <Row className="g-3">
                                            {bookings.slice(0, 5).map((booking) => (
                                                <Col md={12} key={booking.bookingId}>
                                                    <Card className="border-0 shadow-sm rounded-3">
                                                        <Card.Body>
                                                            <Row className="align-items-center">
                                                                <Col md={3}>
                                                                    <Image src={booking.packageImage} style={{ width: '100%', height: '100px', objectFit: 'cover' }} className="rounded-3" />
                                                                </Col>
                                                                <Col md={9}>
                                                                    <div className="d-flex justify-content-between align-items-start">
                                                                        <div>
                                                                            <h6 className="fw-bold mb-1">{booking.packageTitle}</h6>
                                                                            <p className="text-muted small mb-2">
                                                                                <strong>Booking ID:</strong> {booking.bookingId} |
                                                                                <strong> Date:</strong> {new Date(booking.travelDate).toLocaleDateString()} |
                                                                                <strong> Guests:</strong> {booking.adults} Adults, {booking.children} Children
                                                                            </p>
                                                                            <p className="text-muted small mb-0">
                                                                                <strong>Guide:</strong> {booking.guide.name} |
                                                                                <strong> Hotel:</strong> {booking.hotel.name}
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-end">
                                                                            <Badge bg="success" className="mb-2">{booking.status}</Badge>
                                                                            <h5 className="fw-bold mb-0" style={{ color: '#0891b2' }}>{formatPrice(booking.totalAmount)}</h5>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                    {bookings.length > 5 && (
                                        <div className="text-center mt-4">
                                            <Button variant="outline-primary" onClick={() => navigate('/my-bookings')} className="rounded-pill">
                                                View All Bookings
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Tab>

                            {/* Settings Tab */}
                            <Tab eventKey="settings" title={<span><FaCog className="me-2" />Settings</span>}>
                                <div className="p-4">
                                    <h5 className="fw-bold mb-4">Notifications & Preferences</h5>
                                    <Row>
                                        <Col md={6}>
                                            <Card className="border-0 bg-light p-4 mb-4">
                                                <h6 className="fw-bold mb-3">Notification Settings</h6>

                                                <Form.Check
                                                    type="switch"
                                                    id="email-notifications"
                                                    label="Email Notifications"
                                                    checked={settings.emailNotifications}
                                                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                                    className="mb-3"
                                                />

                                                <Form.Check
                                                    type="switch"
                                                    id="sms-notifications"
                                                    label="SMS Notifications"
                                                    checked={settings.smsNotifications}
                                                    onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                                                    className="mb-3"
                                                />

                                                <Form.Check
                                                    type="switch"
                                                    id="newsletter"
                                                    label="Newsletter Subscription"
                                                    checked={settings.newsletterSubscription}
                                                    onChange={(e) => setSettings({ ...settings, newsletterSubscription: e.target.checked })}
                                                    className="mb-3"
                                                />

                                                <Form.Check
                                                    type="switch"
                                                    id="booking-reminders"
                                                    label="Booking Reminders"
                                                    checked={settings.bookingReminders}
                                                    onChange={(e) => setSettings({ ...settings, bookingReminders: e.target.checked })}
                                                />
                                            </Card>
                                        </Col>

                                        <Col md={6}>
                                            <Card className="border-0 bg-light p-4 mb-4">
                                                <h6 className="fw-bold mb-3">General Preferences</h6>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Currency</Form.Label>
                                                    <Form.Select
                                                        value={settings.currency}
                                                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                                        className="p-2 border-2"
                                                        style={{ borderRadius: '8px' }}
                                                    >
                                                        <option value="LKR">Sri Lankan Rupee (LKR)</option>
                                                        <option value="USD">US Dollar (USD)</option>
                                                        <option value="EUR">Euro (EUR)</option>
                                                        <option value="GBP">British Pound (GBP)</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Language</Form.Label>
                                                    <Form.Select
                                                        value={settings.language}
                                                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                                        className="p-2 border-2"
                                                        style={{ borderRadius: '8px' }}
                                                    >
                                                        <option value="English">English</option>
                                                        <option value="Sinhala">Sinhala</option>
                                                        <option value="Tamil">Tamil</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <div className="text-center mt-4">
                                        <Button
                                            variant="primary"
                                            onClick={handleSettingsSave}
                                            className="fw-bold px-5 py-3 rounded-pill"
                                            style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', border: 'none' }}
                                        >
                                            <FaSave className="me-2" />Save Settings
                                        </Button>
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </Card>
                </Container>
            </div>

            <Footer />
        </>
    );
};

export default ProfilePage;
