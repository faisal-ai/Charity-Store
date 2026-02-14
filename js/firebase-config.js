// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBCvt35dMfwNY5PLW0gwbtdCcfputgcE6M",
    authDomain: "bu-mentoring.firebaseapp.com",
    projectId: "bu-mentoring",
    storageBucket: "bu-mentoring.firebasestorage.app",
    messagingSenderId: "172398452298",
    appId: "1:172398452298:web:ee8908b8eed565e03350b3",
    measurementId: "G-PT3DVJX0QG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firebase utilities
export { db, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where };
