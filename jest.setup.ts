
import { jest } from '@jest/globals';

// --- Simulação Abrangente e Estruturada para o Módulo 'firebase-admin' ---
jest.mock('firebase-admin', () => {

  const mockFirestoreFunctions = {
    collection: jest.fn(() => ({
      // doc() agora captura o ID do documento passado como argumento.
      doc: jest.fn((docId) => ({
        // get() retorna um snapshot que INCLUI o ID do documento.
        // Isso simula com precisão o comportamento do SDK real do Firestore.
        get: jest.fn().mockResolvedValue({
          id: docId, // A CORREÇÃO CRÍTICA: O snapshot tem o ID.
          exists: true,
          data: () => ({
            name: 'Mock List Data',
            ownerId: 'user-123', // Para passar na verificação de permissão do CASL.
          }),
        }),
        // set() continua o mesmo.
        set: jest.fn().mockResolvedValue(true),
      })),
      // add() continua o mesmo.
      add: jest.fn().mockResolvedValue({ id: 'new-mock-task-id-456' }),
    })),
  };

  return {
    initializeApp: jest.fn().mockReturnValue({}),
    auth: () => ({
      verifyIdToken: jest.fn().mockImplementation(async (token) => {
        if (token === "valid-token") {
          return { uid: "user-123", email: "user@example.com" };
        }
        throw new Error("Invalid token");
      }),
    }),
    firestore: () => mockFirestoreFunctions,
    credential: {
      cert: jest.fn().mockReturnValue({}),
    },
    get apps() {
      return [{}];
    },
  };
});
