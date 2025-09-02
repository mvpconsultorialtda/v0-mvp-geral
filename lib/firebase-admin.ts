
import admin from 'firebase-admin';

// This function will initialize the admin SDK if it hasn't been already
function ensureFirebaseInitialized() {
  if (!admin.apps.length) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error("Firebase admin initialization error", error);
      throw new Error("Could not initialize Firebase Admin SDK");
    }
  }
}

// A getter function for the auth service
export function getAdminAuth() {
  ensureFirebaseInitialized();
  return admin.auth();
}
