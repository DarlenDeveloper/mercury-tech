// Firebase initialization for the Mercury web app.
//
// Web API keys are public client identifiers (not secrets); access is
// controlled by Firebase Security Rules, not key secrecy. Values can be
// overridden via NEXT_PUBLIC_FIREBASE_* env vars for other environments.
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyDN7l818Y1NdSe9ZNq5P3DEjkjrKlwHeKs",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "mercurycomputers-tech.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "mercurycomputers-tech",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "mercurycomputers-tech.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "322532190054",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:322532190054:web:7a10c7dff62aa3ffbe8aa7",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-THBBERELQC",
};

// Reuse the existing app during hot reloads / SSR instead of re-initializing.
export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
