import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
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
import { compressProfileImage, compressProductImage } from './utils/imageCompressor';

// Firebase configuration placeholder with environment variable overrides
export const firebaseConfig = {
  apiKey: "AIzaSyDFVW_x35UvhptGnoGb6oaoQGopxgLX8xc",
  authDomain: "uzishop-c6d7f.firebaseapp.com",
  projectId: "uzishop-c6d7f",
  storageBucket: "uzishop-c6d7f.firebasestorage.app",
  messagingSenderId: "603925145069",
  appId: "1:603925145069:web:d8d87ddf0cd514b3e1b3e4",
  measurementId: "G-T40SCW75DJ"
};

// Initialize Firebase
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

/**
 * Uploads an image file to Firebase Storage with automatic pre-compression
 * and resilient data URL fallback.
 */
export async function uploadImageFile(file: File, folderPath: string = 'items'): Promise<string> {
  let fileToUpload = file;
  
  // Auto-compress large images if not already compressed
  try {
    if (file.type.startsWith('image/')) {
      if (folderPath === 'avatars') {
        const res = await compressProfileImage(file);
        fileToUpload = res.file;
      } else if (file.size > 200 * 1024) {
        const res = await compressProductImage(file);
        fileToUpload = res.file;
      }
    }
  } catch (compErr) {
    console.warn('Pre-upload compression fallback notice:', compErr);
  }

  try {
    const timestamp = Date.now();
    const cleanFileName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `${folderPath}/${timestamp}_${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage upload fallback to local Data URL:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileToUpload);
    });
  }
}
