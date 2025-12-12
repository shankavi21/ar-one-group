# AR One Tourism - Admin Panel

## 📋 Overview

The AR One Tourism Admin Panel is a comprehensive dashboard for managing all aspects of the tourism application, including users, packages, guides, bookings, contacts, and analytics.

## 🚀 Accessing the Admin Panel

Navigate to: `http://localhost:3000/admin`

**Note:** You must be logged in to access the admin panel. Currently, the system accepts any authenticated user, but in production, you should add role-based access control (admin-only).

## 📊 Features

### 1. **Dashboard** (`/admin`)
- **Stats Cards**: Total users, bookings, packages, pending contacts, guides, and revenue
- **Charts**: 
  - Bookings by Month (Bar chart)
  - Bookings by Status (Pie chart)
- **Recent Bookings Table**: Last 5 bookings with quick overview

### 2. **User Management** (`/admin/users`)
- View all registered users
- Search by name, email, or phone
- Edit user details (name, phone, bio, role)
- Change user roles (User/Admin)
- Delete users
- Statistics: Total users, active users, admin count

### 3. **Package Management** (`/admin/packages`)
- **CRUD Operations**:
  - Create new packages
  - Edit existing packages (title, location, price, duration, description, image)
  - Delete packages
  - View package details
- **Search & Filter**: By title or location
- **Stats**: Total packages, active packages, average price

### 4. **Guide Management** (`/admin/guides`)
- *Coming Soon* - Full CRUD for tour guides
- Will include: name, bio, languages, expertise, ratings

### 5. **Booking Management** (`/admin/bookings`)
- **View all bookings** with comprehensive details
- **Search**: By booking ID, customer name/email, or package
- **Filter**: By status (confirmed, pending, completed, cancelled)
- **Actions**:
  - View full booking details
  - Update booking status
  - Confirm pending bookings
  - Cancel bookings
- **Stats**: Total bookings, confirmed, pending, total revenue
- **Detailed Modal**: Full booking information including customer, package, guide, hotel, payment

### 6. **Contact Inquiries** (`/admin/contacts`)
- View all contact form submissions
- Mark inquiries as resolved
- Delete messages
- View full message details in modal

### 7. **Review Management** (`/admin/reviews`)
- *Coming Soon* - Approve/reject reviews
- Edit or delete inappropriate reviews
- Filter by rating or package

### 8. **Settings** (`/admin/settings`)
- *Coming Soon* - Manage app-wide settings
- Currency conversion rates
- Language translations
- Notification settings

### 9. **Analytics** (`/admin/analytics`)
- *Coming Soon* - Advanced analytics
- Revenue trends
- User growth charts
- Popular packages/destinations
- Export data to CSV

## 🎨 UI Components Used

- **Charts**: Recharts library (Bar charts, Pie charts)
- **Forms**: Formik + Yup validation
- **Tables**: React Bootstrap Tables
- **Modals**: React Bootstrap Modal
- **Icons**: React Icons (FontAwesome)
- **Layout**: Responsive sidebar + top navbar

## 💾 Data Storage

Currently, the admin panel reads from:
- **LocalStorage**: Bookings (`userBookings`), Contacts (`contactMessages`), User preferences
- **Hardcoded Data**: Packages, Guides

### For Production:
Integrate with:
- **Firebase Firestore**: For packages, guides, bookings, reviews
- **Firebase Auth**: For user management with role claims
- **Firebase Storage**: For image uploads

## 🔐 Security (To Be Implemented)

For production deployment, add:

### 1. Protected Routes
```javascript
// Create ProtectedRoute component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const user = auth.currentUser;
  const isAdmin = user?.role === 'admin'; // Check from Firebase custom claims
  
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/home" />;
  
  return children;
};

// Wrap admin routes
<Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
```

### 2. Firebase Security Rules
```javascript
// Firestore rules
service cloud.firestore {
  match /databases/{database}/documents {
    match /packages/{packageId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 3. Set Admin Role
```javascript
// Cloud Function to set admin
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  await admin.auth().setCustomUserClaims(data.uid, { admin: true });
});
```

## 📱 Responsive Design

The admin panel is fully responsive:
- **Desktop**: Full sidebar + main content
- **Mobile**: Collapsible sidebar with hamburger menu
- **Tablets**: Optimized layout

## 🛠️ Adding New Admin Features

### Step 1: Create Page Component
```javascript
// src/admin/pages/NewFeature.js
const NewFeature = () => {
  return <div><h2>New Feature</h2></div>;
};
export default NewFeature;
```

### Step 2: Add Route in App.js
```javascript
import NewFeature from './admin/pages/NewFeature';

<Route path="/admin">
  <Route path="new-feature" element={<NewFeature />} />
</Route>
```

### Step 3: Add Menu Item in AdminLayout
```javascript
const menuItems = [
  // ... existing items
  { path: '/admin/new-feature', icon: FaIcon, label: 'New Feature' },
];
```

## 📞 Support

For questions or issues with the admin panel, contact the development team.

## 🎯 Future Enhancements

1. **Real-time Updates**: Use Firebase real-time listeners
2. **Advanced Analytics**: Google Analytics integration
3. **Email Notifications**: Send emails for booking confirmations
4. **SMS Integration**: Twilio for SMS notifications
5. **Export Features**: Download reports as PDF/Excel
6. **Bulk Operations**: Bulk delete, update multiple records
7. **Activity Logs**: Track admin actions
8. **Multi-language Support**: Admin panel in multiple languages
9. **Dark Mode**: Toggle dark/light theme
10. **Role Management**: Create custom roles with permissions

---

**Version:** 1.0.0  
**Last Updated:** December 2025
