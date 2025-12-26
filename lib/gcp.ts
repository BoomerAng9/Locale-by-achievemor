
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

/**
 * Safely access environment variables.
 * In this environment, we expect them to be available via import.meta.env (Vite)
 */
const getEnv = (key: string, fallback: string): string => {
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key] as string;
    }
  } catch (e) {
    // import.meta.env access might throw in some environments
  }
  return fallback;
};

const firebaseConfig = {
  // Using the provided Project ID and Number
  projectId: "localebyachievemor",
  messagingSenderId: "790279690860",
  // Standard Firebase Web config structure
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSy_PLACEHOLDER_KEY"),
  authDomain: "localebyachievemor.firebaseapp.com",
  storageBucket: "localebyachievemor.appspot.com",
  appId: getEnv("VITE_FIREBASE_APP_ID", "")
};

// Initialize Firebase once
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Fallback or re-use existing app if possible
  try {
    app = initializeApp(firebaseConfig, "fallback");
  } catch (e) {
    console.error("Critical: Could not initialize fallback Firebase app.");
  }
}

export const db = getFirestore(app);
export const auth = getAuth(app);

// Connect to emulators in development
// @ts-ignore
if (import.meta.env.DEV) {
  console.log("Connecting to Firebase Emulators...");
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

// Helper for Firestore data mapping
export const mapDoc = (doc: any) => ({ id: doc.id, ...doc.data() });
