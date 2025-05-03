// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD3TdZ1iV_25hTo9Ss4jHDKO_CSD2IgoDM",
    authDomain: "smart-work-portal.firebaseapp.com",
    projectId: "smart-work-portal",
    storageBucket: "smart-work-portal.firebasestorage.app",
    messagingSenderId: "524412851061",
    appId: "1:524412851061:web:35f9c60db8fb6dad4db93c",
  };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider }; // ✅ THIS IS REQUIRED
