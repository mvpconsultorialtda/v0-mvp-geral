import admin from 'firebase-admin';

// Evita a reinicialização do app em ambiente de desenvolvimento
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK inicializado com sucesso.");
  } catch (error) {
    console.error("Erro ao inicializar o Firebase Admin SDK:", error);
    // Não lance o erro para fora, pois isso pode quebrar o build.
    // Apenas logue o erro.
  }
}

// Função de inicialização para ser usada em outros lugares (como rotas da API)
export const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    console.warn("Firebase Admin SDK não foi inicializado na primeira tentativa.");
  }
};

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
