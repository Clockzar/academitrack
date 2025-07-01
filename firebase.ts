// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPrbkPJHmQxuZIG0FvuT0TruerVLFmVWo",
  authDomain: "academitrack-305ed.firebaseapp.com",
  projectId: "academitrack-305ed",
  storageBucket: "academitrack-305ed.firebasestorage.app",
  messagingSenderId: "1003436649961",
  appId: "1:1003436649961:web:600dbadf0ab221e16b2f78",
  measurementId: "G-6MFDTMK9BC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { GoogleAuthProvider }; // Export the class itself
