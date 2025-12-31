// 🔥 FIREBASE CONFIGURATION
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtPdMq1czpkjaRbfgDlOXVD2rzXoxYn8o",
  authDomain: "booktracker-web.firebaseapp.com",
  projectId: "booktracker-web",
  storageBucket: "booktracker-web.firebasestorage.app",
  messagingSenderId: "545569737160",
  appId: "1:545569737160:web:dcb7851b801173dba258fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connection test
console.log("🔥 Firebase initialized!");
console.log("✅ Auth:", auth ? "Connected" : "Failed");
console.log("✅ Firestore:", db ? "Connected" : "Failed");

export default app;
