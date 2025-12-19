import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';

import PackagesPage from './pages/PackagesPage';
import GuidesPage from './pages/GuidesPage';
import PackageDetailPage from './pages/PackageDetailPage';
import GuideDetailPage from './pages/GuideDetailPage';

import SavedTripsPage from './pages/SavedTripsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Admin imports
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminSigninPage from './admin/pages/AdminSigninPage';
import AdminDashboard from './admin/pages/AdminDashboard';
import UserManagement from './admin/pages/UserManagement';
import PackageManagement from './admin/pages/PackageManagement';
import GuideManagement from './admin/pages/GuideManagement';
import BookingManagement from './admin/pages/BookingManagement';
import ContactManagement from './admin/pages/ContactManagement';
import ReviewManagement from './admin/pages/ReviewManagement';
import OfferManagement from './admin/pages/OfferManagement';
import AdminSettings from './admin/pages/AdminSettings';
import Analytics from './admin/pages/Analytics';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<SigninPage />} />
          <Route path="/register" element={<SignupPage />} />

          {/* User Routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:id" element={<PackageDetailPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/guides/:id" element={<GuideDetailPage />} />
          <Route path="/saved-trips" element={<SavedTripsPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin Routes - Protected */}
          <Route path="/admin/login" element={<AdminSigninPage />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="packages" element={<PackageManagement />} />
            <Route path="guides" element={<GuideManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="contacts" element={<ContactManagement />} />
            <Route path="reviews" element={<ReviewManagement />} />
            <Route path="offers" element={<OfferManagement />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
