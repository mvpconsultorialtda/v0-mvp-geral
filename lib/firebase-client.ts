// lib/firebase-client.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD1F2Gfg83rq4svlXuJTEtal_JeWugd1vU",
  authDomain: "mvp-geral.firebaseapp.com",
  databaseURL: "https://mvp-geral-default-rtdb.firebaseio.com",
  projectId: "mvp-geral",
  storageBucket: "mvp-geral.firebasestorage.app",
  messagingSenderId: "337004740554",
  appId: "1:337004740554:web:09031437f34bce2d22d933",
  measurementId: "G-CHM8MM5DFM"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
let analytics;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
