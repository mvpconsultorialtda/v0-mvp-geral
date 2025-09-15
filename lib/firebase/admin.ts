import * as admin from 'firebase-admin';

if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set. Please see instructions in the README.');
}

let serviceAccount;
try {
  // Parse the stringified JSON from the environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:", error);
  throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Make sure it is a valid JSON string.");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminDb = admin.firestore();
