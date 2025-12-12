# Admin Account Setup Guide

## 🔐 Admin Account Configuration

### Fixed Admin Email
The admin account uses a predefined email address:

**Admin Email:** `admin@arone.lk`

This email is configured in: `src/utils/adminConfig.js`

### How to Create the Admin Account in Firebase

Since the admin email is fixed, you need to create this account in Firebase Authentication:

#### Method 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **AR One Tourism**
3. Navigate to **Authentication** → **Users**
4. Click **"Add User"**
5. Enter:
   - **Email:** `admin@arone.lk`
   - **Password:** Choose a strong password (e.g., `Admin@123` or your preferred password)
6. Click **"Add User"**

#### Method 2: Register via the App

1. Go to `http://localhost:3000/register`
2. Register with:
   - **Email:** `admin@arone.lk`
   - **Password:** Your chosen admin password
   - **Display Name:** Admin or AR One Admin
3. Complete the registration

### How It Works

1. **Login Detection**: When a user logs in via `/login`, the system checks if their email matches `admin@arone.lk`

2. **Automatic Redirect**: 
   - If email is `admin@arone.lk` → Redirect to `/admin` (Admin Dashboard)
   - If email is anything else → Redirect to `/home` (User Homepage)

3. **Protected Routes**: The admin panel at `/admin` is protected:
   - Not logged in → Redirect to `/login`
   - Logged in as regular user → Redirect to `/home`
   - Logged in as admin → Access granted to admin panel

### Code Files Modified

1. **`src/utils/adminConfig.js`** - Admin email configuration
2. **`src/pages/SigninPage.js`** - Login redirect logic
3. **`src/components/AdminProtectedRoute.js`** - Route protection
4. **`src/App.js`** - Admin routes wrapped with protection

### Testing the Admin Account

#### Step 1: Create Admin Account (if not exists)
```
Email: admin@arone.lk
Password: [Your chosen password]
```

#### Step 2: Login
1. Go to `http://localhost:3000/login`
2. Enter admin credentials
3. You should be automatically redirected to `http://localhost:3000/admin`

#### Step 3: Verify Access
- You should see the Admin Dashboard with sidebar navigation
- Regular users should NOT be able to access `/admin`

### Adding More Admin Emails (Optional)

If you want to support multiple admin emails, edit `src/utils/adminConfig.js`:

```javascript
export const ADMIN_CONFIG = {
    emails: [
        'admin@arone.lk',
        'owner@arone.lk',
        'manager@arone.lk'
    ]
};

export const isAdminUser = (email) => {
    return ADMIN_CONFIG.emails.includes(email);
};
```

### Security Notes

⚠️ **Important for Production:**

1. **Never hardcode passwords** in the frontend code
2. **Use Firebase Admin SDK** to set custom claims for role-based access
3. **Implement proper backend validation** for admin operations
4. **Enable Firebase Security Rules** to protect admin-only operations

### Production-Grade Admin Setup

For production, implement proper role-based access control:

#### Step 1: Use Firebase Custom Claims
```javascript
// Cloud Function to set admin role
const admin = require('firebase-admin');

exports.setAdminRole = functions.https.onCall(async (data, context) => {
    // Check if requester is already an admin
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be an admin to set admin role'
        );
    }
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(data.uid, {
        admin: true
    });
    
    return { message: 'Admin role set successfully' };
});
```

#### Step 2: Check Custom Claims in Frontend
```javascript
export const isCurrentUserAdmin = async (user) => {
    if (!user) return false;
    const idTokenResult = await user.getIdTokenResult();
    return !!idTokenResult.claims.admin;
};
```

### Troubleshooting

**Q: I created the admin account but still redirected to /home**
- A: Make sure the email is exactly `admin@arone.lk` (case-sensitive)
- Check the browser console for any errors

**Q: I can access /admin but see a blank page**
- A: Check if there are any JavaScript errors in the console
- Verify all admin components are imported correctly

**Q: How do I change the admin email?**
- A: Edit `src/utils/adminConfig.js` and change the email value

**Q: Can I have multiple admins?**
- A: Yes! See "Adding More Admin Emails" section above

---

**Current Admin Email:** `admin@arone.lk`  
**Status:** Active  
**Dashboard URL:** `/admin`
