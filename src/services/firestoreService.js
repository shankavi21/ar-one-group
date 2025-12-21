import { db } from '../firebase';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    getDoc,
    onSnapshot
} from 'firebase/firestore';


// --- USERS ---

export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting users:", error);
        throw error;
    }
};

export const getSavedTrips = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            return userDoc.data().savedTrips || [];
        }
        return [];
    } catch (error) {
        console.error("Error getting saved trips:", error);
        return [];
    }
};

export const toggleSavedTrip = async (userId, packageId) => {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        let savedTrips = [];
        if (userDoc.exists()) {
            savedTrips = userDoc.data().savedTrips || [];
        }

        if (savedTrips.includes(packageId)) {
            savedTrips = savedTrips.filter(id => id !== packageId);
        } else {
            savedTrips.push(packageId);
        }

        await updateDoc(userRef, {
            savedTrips: savedTrips,
            updatedAt: serverTimestamp()
        });
        return savedTrips;
    } catch (error) {
        console.error("Error toggling saved trip:", error);
        throw error;
    }
};

// --- PACKAGES ---

export const getAllPackages = async () => {
    try {
        const q = query(collection(db, "packages"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting packages:", error);
        throw error;
    }
};

export const addPackage = async (packageData) => {
    try {
        const docRef = await addDoc(collection(db, "packages"), {
            ...packageData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding package:", error);
        throw error;
    }
};

export const updatePackage = async (id, packageData) => {
    try {
        const packageRef = doc(db, "packages", id);
        await updateDoc(packageRef, {
            ...packageData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating package:", error);
        throw error;
    }
};

export const deletePackage = async (id) => {
    try {
        await deleteDoc(doc(db, "packages", id));
    } catch (error) {
        console.error("Error deleting package:", error);
        throw error;
    }
};

// --- GUIDES ---

export const getAllGuides = async () => {
    try {
        const q = query(collection(db, "guides"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting guides:", error);
        throw error;
    }
};

export const addGuide = async (guideData) => {
    try {
        const docRef = await addDoc(collection(db, "guides"), {
            ...guideData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding guide:", error);
        throw error;
    }
};

export const updateGuide = async (id, guideData) => {
    try {
        const guideRef = doc(db, "guides", id);
        await updateDoc(guideRef, {
            ...guideData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating guide:", error);
        throw error;
    }
};

export const deleteGuide = async (id) => {
    try {
        await deleteDoc(doc(db, "guides", id));
    } catch (error) {
        console.error("Error deleting guide:", error);
        throw error;
    }
};

export const getGuide = async (id) => {
    try {
        const docRef = doc(db, "guides", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting guide:", error);
        throw error;
    }
};

export const getGuideByUid = async (uid) => {
    try {
        const q = query(collection(db, "guides"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    } catch (error) {
        console.error("Error getting guide by uid:", error);
        throw error;
    }
};

export const getPackage = async (id) => {
    try {
        const docRef = doc(db, "packages", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting package:", error);
        throw error;
    }
};

export const getBookingsByDate = async (date) => {
    try {
        const q = query(collection(db, "bookings"), where("travelDate", "==", date));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting bookings by date:", error);
        throw error;
    }
};

// --- BOOKINGS ---

export const getAllBookings = async () => {
    try {
        const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting bookings:", error);
        throw error;
    }
};

export const getUserBookings = async (userId) => {
    try {
        const q = query(collection(db, "bookings"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting user bookings:", error);
        throw error;
    }
};

export const getGuideBookings = async (guideId) => {
    try {
        // Fetch by guideId only to avoid index requirement for multiple fields/ordering
        const q = query(collection(db, "bookings"), where("guide.id", "==", guideId));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in memory
        return data.sort((a, b) => new Date(b.travelDate) - new Date(a.travelDate));
    } catch (error) {
        console.error("Error getting guide bookings:", error);
        throw error;
    }
};

export const createBooking = async (bookingData) => {
    try {
        // Use provided bookingId or generate one
        const bookingId = bookingData.bookingId || `BK-${Date.now().toString().slice(-6)}`;

        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            bookingId: bookingId,
            status: bookingData.status || 'pending',
            paymentStatus: bookingData.paymentStatus || 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Create notification for guide if assigned
        if (bookingData.guide?.id && bookingData.guide.id !== 'no-guide') {
            await createNotification({
                guideId: bookingData.guide.id,
                title: 'New Booking Assigned!',
                message: `You have a new booking for ${bookingData.packageTitle} on ${bookingData.travelDate}.`,
                type: 'new_booking',
                bookingId: docRef.id
            });
        }

        return docRef.id;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

export const updateBookingStatus = async (id, status) => {
    try {
        const bookingRef = doc(db, "bookings", id);
        await updateDoc(bookingRef, {
            status: status,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        throw error;
    }
};

// --- CONTACTS ---

export const getAllContacts = async () => {
    try {
        const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting contacts:", error);
        throw error;
    }
};

export const submitContact = async (contactData) => {
    try {
        const docRef = await addDoc(collection(db, "contacts"), {
            ...contactData,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error submitting contact:", error);
        throw error;
    }
};

export const updateContactStatus = async (id, status) => {
    try {
        const contactRef = doc(db, "contacts", id);
        await updateDoc(contactRef, {
            status: status,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating contact status:", error);
        throw error;
    }
};

export const deleteContact = async (id) => {
    try {
        await deleteDoc(doc(db, "contacts", id));
    } catch (error) {
        console.error("Error deleting contact:", error);
        throw error;
    }
};

// --- REVIEWS ---

export const getAllReviews = async () => {
    try {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting reviews:", error);
        throw error;
    }
};

export const getApprovedReviews = async () => {
    try {
        const q = query(collection(db, "reviews"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting approved reviews:", error);
        throw error;
    }
};

export const addReview = async (reviewData) => {
    try {
        const docRef = await addDoc(collection(db, "reviews"), {
            ...reviewData,
            status: 'pending', // Reviews start as pending moderation
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding review:", error);
        throw error;
    }
};

export const updateReview = async (id, reviewData) => {
    try {
        const reviewRef = doc(db, "reviews", id);
        await updateDoc(reviewRef, {
            ...reviewData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating review:", error);
        throw error;
    }
};

export const updateReviewStatus = async (id, status) => {
    try {
        const reviewRef = doc(db, "reviews", id);
        await updateDoc(reviewRef, {
            status: status,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating review status:", error);
        throw error;
    }
};

export const deleteReview = async (id) => {
    try {
        await deleteDoc(doc(db, "reviews", id));
    } catch (error) {
        console.error("Error deleting review:", error);
        throw error;
    }
};

export const getGuideReviews = async (guideId, onlyApproved = true) => {
    try {
        // Sort/Filter in memory to avoid composite index requirement
        const q = query(collection(db, "reviews"), where("guideId", "==", guideId));
        const querySnapshot = await getDocs(q);
        const allReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (onlyApproved) {
            return allReviews.filter(review => review.status === "approved");
        }
        return allReviews;
    } catch (error) {
        console.error("Error getting guide reviews:", error);
        throw error;
    }
};

// --- OFFERS ---

export const getAllOffers = async () => {
    try {
        const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting offers:", error);
        throw error;
    }
};

export const addOffer = async (offerData) => {
    try {
        const docRef = await addDoc(collection(db, "offers"), {
            ...offerData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding offer:", error);
        throw error;
    }
};

export const updateOffer = async (id, offerData) => {
    try {
        const offerRef = doc(db, "offers", id);
        await updateDoc(offerRef, {
            ...offerData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating offer:", error);
        throw error;
    }
};

export const deleteOffer = async (id) => {
    try {
        await deleteDoc(doc(db, "offers", id));
    } catch (error) {
        console.error("Error deleting offer:", error);
        throw error;
    }
};

export const verifyOfferCode = async (code) => {
    try {
        const q = query(collection(db, "offers"), where("code", "==", code));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { valid: false, message: "Invalid offer code" };
        }

        const offer = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };

        if (offer.status !== 'active') {
            return { valid: false, message: "This offer is no longer active" };
        }

        if (offer.validUntil) {
            const expiry = new Date(offer.validUntil);
            expiry.setDate(expiry.getDate() + 1); // Valid until end of day
            if (new Date() > expiry) {
                return { valid: false, message: "This offer has expired" };
            }
        }

        return { valid: true, offer };
    } catch (error) {
        console.error("Error verifying offer:", error);
        throw error;
    }
};

// --- GUIDE AVAILABILITY & BLOCKED DATES ---

export const getBlockedDates = async (guideId) => {
    try {
        const q = query(collection(db, "blocked_dates"), where("guideId", "==", guideId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting blocked dates:", error);
        throw error;
    }
};

export const getBlockedDatesByDate = async (date) => {
    try {
        const q = query(collection(db, "blocked_dates"), where("date", "==", date));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting blocked dates by date:", error);
        throw error;
    }
};

export const addBlockedDate = async (blockedData) => {
    try {
        const docRef = await addDoc(collection(db, "blocked_dates"), {
            ...blockedData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding blocked date:", error);
        throw error;
    }
};

export const deleteBlockedDate = async (id) => {
    try {
        await deleteDoc(doc(db, "blocked_dates", id));
    } catch (error) {
        console.error("Error deleting blocked date:", error);
        throw error;
    }
};

// --- NOTIFICATIONS ---

export const getGuideNotifications = (guideId, callback) => {
    const q = query(
        collection(db, "notifications"),
        where("guideId", "==", guideId)
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort by date in memory
        const sorted = notifications.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        callback(sorted);
    });
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const docRef = doc(db, "notifications", notificationId);
        await updateDoc(docRef, { read: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

export const createNotification = async (notificationData) => {
    try {
        await addDoc(collection(db, "notifications"), {
            ...notificationData,
            read: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

// --- PAYOUTS ---

export const recordGuidePayout = async (payoutData) => {
    try {
        const docRef = await addDoc(collection(db, "payouts"), {
            ...payoutData,
            createdAt: serverTimestamp()
        });

        // Update the booking to mark as payout_recorded if applicable
        if (payoutData.bookingId) {
            // We need to find the document ID for the booking. 
            // In our system, bookingId might be the human-readable ID.
            // But let's assume for now we just want the record.
        }

        return docRef.id;
    } catch (error) {
        console.error("Error recording payout:", error);
        throw error;
    }
};

export const getGuidePayouts = async (guideId) => {
    try {
        const q = query(
            collection(db, "payouts"),
            where("guideId", "==", guideId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => {
            const dateA = a.payoutDate || a.createdAt?.seconds || 0;
            const dateB = b.payoutDate || b.createdAt?.seconds || 0;
            return new Date(dateB) - new Date(dateA);
        });
    } catch (error) {
        console.error("Error getting payouts:", error);
        throw error;
    }
};

export const getAllPayouts = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "payouts"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => new Date(b.createdAt?.seconds * 1000) - new Date(a.createdAt?.seconds * 1000));
    } catch (error) {
        console.error("Error getting all payouts:", error);
        throw error;
    }
};
