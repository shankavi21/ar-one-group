// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBHEfd7QA8gvcgiwO3coXDwiE4DILUGXz4",
    authDomain: "ar-one-33f7d.firebaseapp.com",
    projectId: "ar-one-33f7d",
    storageBucket: "ar-one-33f7d.firebasestorage.app",
    messagingSenderId: "985849759746",
    appId: "1:985849759746:web:06753bccee0a3d8c25ff1b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
