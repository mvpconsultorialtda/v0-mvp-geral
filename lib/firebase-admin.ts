// lib/firebase-admin.ts
import * as admin from "firebase-admin";

// ATENÇÃO: Para esta configuração funcionar, você precisa:
// 1. Ir ao seu console do Firebase -> Configurações do Projeto -> Contas de Serviço.
// 2. Clicar em "Gerar nova chave privada" e fazer o download do arquivo JSON.
// 3. NÃO adicione este arquivo JSON diretamente ao seu projeto. Em vez disso,
//    copie o conteúdo do arquivo JSON para uma variável de ambiente.
// 4. Crie um arquivo `.env.local` na raiz do seu projeto.
// 5. Adicione a seguinte linha a `.env.local`:
//    FIREBASE_SERVICE_ACCOUNT_JSON='<COLE_O_CONTEUDO_DO_JSON_AQUI>'
// 6. Adicione também a URL do seu banco de dados Firestore:
//    FIREBASE_DATABASE_URL='https://<SEU-PROJETO-ID>.firebaseio.com'

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log("Firebase Admin SDK initialized.");
  } else {
    // Lança um erro claro se as credenciais não estiverem configuradas
    throw new Error(
      "Firebase Admin SDK not initialized. Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable. Please check your .env.local file and the instructions in lib/firebase-admin.ts"
    );
  }
}

// Exporta `auth` e `db` para consistência com o resto do código
export const auth = admin.auth();
export const db = admin.firestore();
