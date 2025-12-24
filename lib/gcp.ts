
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Safely access environment variables.
 * In this environment, we expect them to be available via process.env if injected,
 * or we use safe fallbacks for public configurations.
 */
const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // process.env access might throw in some strict browser environments
  }
  return fallback;
};

const firebaseConfig = {
  // Using the provided Project ID and Number
  projectId: "localebyachievemor",
  messagingSenderId: "790279690860",
  // Standard Firebase Web config structure
  apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "AIzaSy_PLACEHOLDER_KEY"),
  authDomain: "localebyachievemor.firebaseapp.com",
  storageBucket: "localebyachievemor.appspot.com",
  appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "")
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

// Helper for Firestore data mapping
export const mapDoc = (doc: any) => ({ id: doc.id, ...doc.data() });
