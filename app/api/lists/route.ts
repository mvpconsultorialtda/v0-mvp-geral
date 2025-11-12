import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin.server';
import { withAuth } from '@/lib/api/middleware';

// GET /api/lists
// Obtém as listas de tarefas do usuário.
export const GET = withAuth(async (request, { user }) => {
  const userId = user.uid;

  const db = getFirestore();
  try {
    const listsSnapshot = await db.collection('lists').where('ownerId', '==', userId).get();
    const lists = listsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching lists:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to fetch lists.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
});

// POST /api/lists
// Cria uma nova lista de tarefas.
export const POST = withAuth(async (request, { user }) => {
  const userId = user.uid;

  const db = getFirestore();
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

    const docRef = await db.collection('lists').add(newList);

    return NextResponse.json({ id: docRef.id, ...newList }, { status: 201 });

  } catch (error) {
    console.error("Error creating list:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to create list.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
});
