import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAv0Wi-eudKvmPQojERBaWNwiuv0uxa_y8",
  authDomain: "docman-b4507.firebaseapp.com",
  databaseURL: "https://docman-b4507-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "docman-b4507",
  storageBucket: "docman-b4507.firebasestorage.app",
  messagingSenderId: "111859036232",
  appId: "1:111859036232:web:a0a04b2545af1a0959287d",
  measurementId: "G-GXLCFGPJMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app; 