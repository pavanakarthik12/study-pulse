// src/firebase/config.js 
import { initializeApp } from "firebase/app"; 
import { getAuth } from "firebase/auth"; 
 
// Firebase config with direct values
const firebaseConfig = { 
  apiKey: "AIzaSyDs2NBjyBKlhX1XFVwyP-95SldMEZRGufg", 
  authDomain: "study-pulse-85ca1.firebaseapp.com", 
  projectId: "study-pulse-85ca1", 
  storageBucket: "study-pulse-85ca1.firebasestorage.app", 
  messagingSenderId: "379117189383", 
  appId: "1:379117189383:web:daed16f62b9b193c47eda2", 
  measurementId: "G-YQ7NEWV6S6" 
}; 
 
// Initialize Firebase 
const app = initializeApp(firebaseConfig); 
export const auth = getAuth(app); 

// Helper function to get Firebase token
export const getFirebaseToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  try {
    return await user.getIdToken(true);
  } catch (error) {
    console.error("Error getting Firebase token:", error);
    return null;
  }
};

export default app;