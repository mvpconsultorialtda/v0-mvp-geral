
import admin from 'firebase-admin';

// This function will initialize the admin SDK if it hasn't been initialized already
function ensureFirebaseInitialized() {
  if (!admin.apps.length) {
    try {
      // Instead of parsing a JSON string, we build the service account object
      // from the individual environment variables.
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      // Check if the required environment variables are present.
      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Firebase Admin SDK environment variables are not set.");
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
      console.error("Firebase admin initialization error", error);
      // Pass the original error message for better debugging.
      throw new Error(`Could not initialize Firebase Admin SDK: ${error.message}`);
    }
  }
}

// A getter function for the auth service
export function getAdminAuth() {
  ensureFirebaseInitialized();
  return admin.auth();
}

// A getter function for Firestore
export function getFirestore() {
  ensureFirebaseInitialized();
  return admin.firestore();
}
