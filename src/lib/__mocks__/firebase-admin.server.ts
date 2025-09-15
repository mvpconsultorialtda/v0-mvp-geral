
// --- Mock Manual para o Módulo firebase-admin.server ---

import { jest } from '@jest/globals';

// Este é o mock da função que seria retornada por getAdminAuth().
// É exportado para que possamos sobrescrevê-lo em testes individuais se necessário.
export const mockVerifySessionCookie = jest.fn().mockResolvedValue({ uid: 'default-mock-user', role: 'user' });

// Esta é a função getAdminAuth mockada.
const getAdminAuth = jest.fn(() => ({
  verifySessionCookie: mockVerifySessionCookie,
}));

// Esta é a função getFirestore mockada (atualmente não faz nada).
const getFirestore = jest.fn(() => ({}));

// Exportamos as funções mockadas para que o Jest as use no lugar do módulo real.
module.exports = { getAdminAuth, getFirestore };
