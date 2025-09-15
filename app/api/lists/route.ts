import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase/admin';

// GET /api/lists
// Obtém as listas de tarefas do usuário.
export async function GET() {
  // TODO: Extrair o UID do usuário a partir do token de autenticação.
  const userId = "mock-user-id";

  try {
    const listsSnapshot = await adminDb.collection('lists').where('ownerId', '==', userId).get();
    const lists = listsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching lists:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to fetch lists.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

// POST /api/lists
// Cria uma nova lista de tarefas.
export async function POST(request: Request) {
  // TODO: Extrair o UID do usuário a partir do token de autenticação.
  const userId = "mock-user-id";

  try {
    const { name } = await request.json();

    if (!name) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Name is required.' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const newList = {
      name,
      ownerId: userId,
      sharedWith: [],
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('lists').add(newList);

    return NextResponse.json({ id: docRef.id, ...newList }, { status: 201 });

  } catch (error) {
    console.error("Error creating list:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to create list.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
