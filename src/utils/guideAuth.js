import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBHEfd7QA8gvcgiwO3coXDwiE4DILUGXz4",
    authDomain: "ar-one-33f7d.firebaseapp.com",
    projectId: "ar-one-33f7d",
    storageBucket: "ar-one-33f7d.firebasestorage.app",
    messagingSenderId: "985849759746",
    appId: "1:985849759746:web:06753bccee0a3d8c25ff1b"
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
