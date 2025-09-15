
import * as admin from 'firebase-admin';

// Guarda as instâncias inicializadas para que não precisemos reinicializar.
let auth: admin.auth.Auth;
let firestore: admin.firestore.Firestore;

/**
 * Garante que o SDK do Firebase Admin seja inicializado, mas apenas uma vez.
 * Este é um padrão Singleton para evitar múltiplas instâncias da aplicação.
 */
function ensureFirebaseInitialized() {
  if (!admin.apps.length) {
    const {
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY
    } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      throw new Error('As variáveis de ambiente do Firebase (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) não estão definidas.');
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: FIREBASE_PROJECT_ID,
      });
    } catch (error: any) {
      console.error("Firebase admin initialization error", error);
      throw new Error(`Could not initialize Firebase Admin SDK: ${error.message}`);
    }
  }
}

/**
 * Retorna a instância de autenticação do Firebase Admin, inicializando se necessário.
 * @returns {admin.auth.Auth} A instância de autenticação do Admin SDK.
 */
export function getAdminAuth(): admin.auth.Auth {
  if (!auth) {
    ensureFirebaseInitialized();
    auth = admin.auth();
  }
  return auth;
}

/**
 * Retorna a instância do Firestore do Firebase Admin, inicializando se necessário.
 * @returns {admin.firestore.Firestore} A instância do Firestore do Admin SDK.
 */
export function getFirestore(): admin.firestore.Firestore {
  if (!firestore) {
    ensureFirebaseInitialized();
    firestore = admin.firestore();
  }
  return firestore;
}
