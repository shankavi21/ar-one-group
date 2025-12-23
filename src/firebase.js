// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCAFYZ6tXphRrT9hOI1feDfPJlc8yJxLyI",
    authDomain: "ar0ne-a1675.firebaseapp.com",
    projectId: "ar0ne-a1675",
    storageBucket: "ar0ne-a1675.firebasestorage.app",
    messagingSenderId: "648362500714",
    appId: "1:648362500714:web:cc12ca6d27a1755ceda013"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
