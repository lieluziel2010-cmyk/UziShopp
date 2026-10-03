// Firebase Configuration & Initialization
// UziShop - Connected to Firebase Project: uzishop-c6d7f

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyDFVW_x35UvhptGnoGb6oaoQGopxgLX8xc",
  authDomain: "uzishop-c6d7f.firebaseapp.com",
  projectId: "uzishop-c6d7f",
  storageBucket: "uzishop-c6d7f.firebasestorage.app",
  messagingSenderId: "603925145069",
  appId: "1:603925145069:web:d8d87ddf0cd514b3e1b3e4",
  measurementId: "G-T40SCW75DJ"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ 
  prompt: 'select_account' 
});

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export default app;
