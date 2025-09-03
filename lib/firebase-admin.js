
import admin from 'firebase-admin';

let firebaseApp;

// Função para garantir que o Firebase seja inicializado apenas uma vez
function ensureFirebaseInitialized() {
  if (!firebaseApp) {
    try {
      // Verifica se a variável de ambiente existe antes de fazer o parse
      if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY não está definida nas variáveis de ambiente.');
      }
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error("Falha ao inicializar o Firebase Admin SDK:", error);
      // Lançar o erro novamente ou lidar com ele de forma apropriada
      throw error;
    }
  }
}

// Garante a inicialização antes de exportar
ensureFirebaseInitialized();

export const authAdmin = admin.auth();
export const dbAdmin = admin.firestore();
