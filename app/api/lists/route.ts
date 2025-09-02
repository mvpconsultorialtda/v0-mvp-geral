import { NextResponse } from 'next/server';

// Rota de API para obter as listas de tarefas de um usuário.
// ATENÇÃO: Esta é uma versão MOCADA. A lógica real de buscar
// do Firestore com base no UID do usuário autenticado será
// implementada na próxima fase.

export async function GET() {
  // TODO: Extrair o UID do usuário a partir do token de autenticação verificado.
  const userId = "mock-user-id"; 

  try {
    // TODO: Substituir com a chamada real ao Firestore:
    // const listsSnapshot = await adminDb.collection('todoLists').where('ownerId', '==', userId).get();
    // const lists = listsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const mockLists = [
      { id: 'list-1', name: 'Trabalho', ownerId: userId, visibility: 'private' },
      { id: 'list-2', name: 'Compras de Casa', ownerId: userId, visibility: 'private' },
      { id: 'list-3', name: 'Projeto Secreto (Compartilhado)', ownerId: 'another-user', visibility: 'shared', members: [{ userId, role: 'viewer' }] },
    ];

    return NextResponse.json(mockLists);
  } catch (error) {
    console.error("Error fetching lists:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to fetch lists.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
