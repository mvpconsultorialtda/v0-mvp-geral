
import admin from 'firebase-admin';

// This function will initialize the admin SDK if it hasn't been initialized already
function ensureFirebaseInitialized() {
  if (admin.apps.length > 0) {
    return;
  }

  try {
    // Use a single, robust environment variable holding the entire JSON content.
    // This avoids all issues with private key formatting.
    const credentialsJson = process.env.FIREBASE_CREDENTIALS_JSON;

    if (!credentialsJson) {
      throw new Error("Firebase credentials are not set in the FIREBASE_CREDENTIALS_JSON environment variable.");
    }

    const serviceAccount = JSON.parse(credentialsJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

  } catch (error: any) {
    console.error("Firebase admin initialization error", error);
    // Pass the original error message for better debugging.
    throw new Error(`Could not initialize Firebase Admin SDK: ${error.message}`);
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
