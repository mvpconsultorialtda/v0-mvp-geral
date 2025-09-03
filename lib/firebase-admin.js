import admin from 'firebase-admin';

let firebaseApp;

function ensureFirebaseInitialized() {
  if (!firebaseApp) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      console.log('Firebase admin initialized successfully.');
    } catch (error) {
      console.error('Firebase admin initialization error', error);
      throw new Error('Could not initialize Firebase Admin SDK');
    }
  }
}

export function getAdminAuth() {
  ensureFirebaseInitialized();
  return admin.auth();
}

export function getAdminDb() {
  ensureFirebaseInitialized();
  return admin.database();
}
