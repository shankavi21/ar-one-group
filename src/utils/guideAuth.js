import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCAFYZ6tXphRrT9hOI1feDfPJlc8yJxLyI",
    authDomain: "ar0ne-a1675.firebaseapp.com",
    projectId: "ar0ne-a1675",
    storageBucket: "ar0ne-a1675.firebasestorage.app",
    messagingSenderId: "648362500714",
    appId: "1:648362500714:web:cc12ca6d27a1755ceda013"
};

// Initialize a secondary Firebase app for creating guide accounts
// This prevents the current session (Admin) from being logged out
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getAuth(secondaryApp);

export const createGuideAccount = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        // Immediately sign out from the secondary app instance
        await signOut(secondaryAuth);

        return user;
    } catch (error) {
        console.error("Error creating guide account:", error);
        throw error;
    }
};
