# Review Moderation System

## Overview
AR One Tourism now has a comprehensive review moderation system where all user-submitted reviews must be approved by admins before appearing publicly on the website.

## How It Works

### 1. **User Submits Review**
- Users can submit reviews from the HomePage's "Write a Review" section
- When a review is submitted:
  - It's saved to `localStorage` with `status: 'pending'`
  - User receives confirmation: "Thank you for your review! It will be published after admin approval."
  - **The review does NOT appear on the public website immediately**

### 2. **Admin Reviews Submissions**
- Admins navigate to **Admin Dashboard → Review Management** (`/admin/reviews`)
- All pending reviews are visible in the review table
- Each review shows:
  - User name and email
  - Package/Guide being reviewed  
  - Star rating (1-5 stars)
  - Comment text
  - Submission date
  - Current status (Pending/Approved/Rejected)

### 3. **Admin Actions**

#### **Approve Review**
- Click the **green checkmark (✓)** button
- Review status changes to `approved`
- Review immediately appears on the public website
- Users can now see the review on HomePage

#### **Reject Review**
- Click the **red X (✗)** button  
- Review status changes to `rejected`
- Review will **NEVER** appear on public website
- Stays in admin panel for record-keeping

#### **Edit Review**
- Click the **eye icon** to view details
- Click **"Edit Comment"** button
- Modify inappropriate or incorrect content
- Save changes
- Edited review can then be approved

#### **Delete Review**
- Click the **trash icon**
- Confirms deletion with popup
- Review is permanently removed from system
- Cannot be recovered

### 4. **Public Display**
- **HomePage** only displays reviews with `status: 'approved'`
- Real-time updates: When admin approves/rejects a review, changes reflect immediately
- No pending or rejected reviews are shown to public users

## Data Flow

```
User Submits Review
       ↓
Saved to localStorage with status: 'pending'
       ↓
Admin sees in Review Management
       ↓
       ├─→ Approve → status: 'approved' → Shows on website ✅
       ├─→ Reject → status: 'rejected' → Never shows ❌
       └─→ Delete → Removed from system 🗑️
```

## Technical Implementation

### Storage Location
- **LocalStorage Key:** `reviews`
- **Format:** Array of review objects

### Review Object Structure
```javascript
{
  id: 1234567890,                    // Unique timestamp ID
  userName: 'John Doe',              // Review author name
  userEmail: 'john@example.com',     // Review author email
  packageName: 'Sigiriya Adventure', // Package being reviewed (optional)
  packageId: 1,                      // Package ID (optional)
  guideName: 'Saman Perera',         // Guide being reviewed (optional)
  guideId: 1,                        // Guide ID (optional)
  rating: 5,                         // Star rating (1-5)
  comment: 'Great experience!',      // Review text
  date: '2025-12-12T07:00:00.000Z', // Submission timestamp
  status: 'pending'                  // 'pending', 'approved', or 'rejected'
}
```

### Real-Time Updates
- Uses `window.dispatchEvent(new Event('local-storage-update'))` 
- HomePage listens for this event and reloads approved reviews
- Changes in Admin Panel reflect immediately on public site

## Admin Dashboard Statistics

The Review Management page shows:
- **Total Reviews:** All reviews in system
- **Approved:** Reviews visible on website
- **Pending:** Reviews awaiting moderation (⚠️ Requires attention)
- **Rejected:** Reviews that were declined
- **Avg Rating:** Average star rating across all reviews

## Filter Options

Admins can filter reviews by status:
- **All Reviews** - Shows everything
- **Approved** - Only approved reviews
- **Pending** - Reviews needing moderation (⚠️ Priority)
- **Rejected** - Previously rejected reviews

## Security & Best Practices

### ✅ **Current Implementation**
- All new reviews start as `pending`
- Public only sees `approved` reviews
- Admin validation required before publication
- Edit capability for content moderation

### 🔒 **For Production** (Future Enhancement)
1. **Backend Validation:** Move review storage to Firestore
2. **Spam Detection:** Integrate content moderation API
3. **User Authentication:** Verify user identity before review submission
4. **Rate Limiting:** Prevent review spam (e.g., 1 review per user per package)
5. **Email Notifications:** Notify users when their review is approved/rejected
6. **Admin Audit Log:** Track who approved/rejected which reviews

## Usage Guide for Admins

### Step 1: Access Review Management
```
Login as admin → Navigate to /admin/reviews
```

### Step 2: View Pending Reviews
```
Filter: Select "Pending" to see reviews awaiting approval
```

### Step 3: Review Submission
```
1. Click eye icon (👁️) to view full review
2. Read the comment carefully
3. Check for:
   - Inappropriate language
   - Spam content
   - Genuine feedback
   - Accurate information
```

### Step 4: Take Action
```
• Approve: Good reviews → Click ✓ (green checkmark)
• Edit: Minor issues → Click "Edit Comment" → Fix → Approve
• Reject: Spam/inappropriate → Click ✗ (red X)
• Delete: Severe violations → Click 🗑️ (trash icon)
```

### Step 5: Monitor
```
Check "Pending" count regularly
Respond to new reviews within 24-48 hours for best UX
```

## Files Modified

1. **`src/pages/HomePage.js`**
   - Review submission saves to localStorage with `status: 'pending'`
   - Display only shows `status: 'approved'` reviews
   - Real-time listening for admin approvals

2. **`src/admin/pages/ReviewManagement.js`**
   - Full CRUD for reviews
   - Approve/Reject/Edit/Delete functionality
   - Dispatches storage events for real-time updates

## Benefits

✅ **Quality Control:** Prevent spam and inappropriate content  
✅ **Brand Protection:** Review all feedback before publication  
✅ **Flexibility:** Edit reviews for minor corrections  
✅ **Transparency:** Users know their review is being reviewed  
✅ **Real-Time:** Approved reviews appear immediately  
✅ **Admin Power:** Full control over what appears on website  

---

**Status:** ✅ Fully Implemented and Operational  
**Last Updated:** December 12, 2025
