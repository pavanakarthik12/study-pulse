import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper function to store Firebase token in localStorage with refresh
export const setAuthToken = async (user) => {
  if (user) {
    try {
      // Force token refresh to ensure we have the latest token
      const token = await user.getIdToken(true);
      localStorage.setItem('authToken', token);
      
      // Set token refresh interval (every 30 minutes)
      const refreshInterval = 30 * 60 * 1000; // 30 minutes
      
      // Clear any existing refresh interval
      if (window.tokenRefreshInterval) {
        clearInterval(window.tokenRefreshInterval);
      }
      
      // Set up new refresh interval
      window.tokenRefreshInterval = setInterval(async () => {
        try {
          const refreshedToken = await user.getIdToken(true);
          localStorage.setItem('authToken', refreshedToken);
          console.log('Auth token refreshed');
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }, refreshInterval);
      
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      localStorage.removeItem('authToken');
      throw error;
    }
  } else {
    localStorage.removeItem('authToken');
    if (window.tokenRefreshInterval) {
      clearInterval(window.tokenRefreshInterval);
      window.tokenRefreshInterval = null;
    }
  }
};

// Set up auth state listener to manage token
onAuthStateChanged(auth, (user) => {
  setAuthToken(user);
});

export { auth, db };