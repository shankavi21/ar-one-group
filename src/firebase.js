// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBV6iVderp6BXhWeNALs-idg3nn5Mk2uac",
    authDomain: "ar-one-2bd7a.firebaseapp.com",
    projectId: "ar-one-2bd7a",
    storageBucket: "ar-one-2bd7a.firebasestorage.app",
    messagingSenderId: "170226392948",
    appId: "1:170226392948:web:222c126f97c0961600d621"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
