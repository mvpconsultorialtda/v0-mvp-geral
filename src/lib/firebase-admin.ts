
import admin from 'firebase-admin';

// Esta função irá inicializar o SDK de administração se ainda não tiver sido inicializado
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

// Uma função getter para o serviço de autenticação
export function getAdminAuth() {
  ensureFirebaseInitialized();
  return admin.auth();
}

// Uma função getter para o Firestore
export function getFirestore() {
  ensureFirebaseInitialized();
  return admin.firestore();
}
