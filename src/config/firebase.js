/**
 * Firebase Configuration for Expo
 * Place in: src/config/firebase.js
 * 
 * For Expo, we only use Firestore for real-time notifications
 * Push notifications are handled by expo-notifications + FCM
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAVsepGas0v1J4CTtGxQUelq7c5UaEBYeU",
  authDomain: "manzilah-notifications.firebaseapp.com",
  projectId: "manzilah-notifications",
  storageBucket: "manzilah-notifications.firebasestorage.app",
  messagingSenderId: "987112798700",
  appId: "1:987112798700:web:8ea6458a202e2147b1a8c9",
  measurementId: "G-S2RE9DLLET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { app, db };
export default firebaseConfig;