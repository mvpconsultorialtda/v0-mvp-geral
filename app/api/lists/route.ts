import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { createList } from '@/modules/task-lists/core.server';

// GET /api/lists
// Obtém as listas de tarefas do usuário.
export const GET = withAuth(async (request, { user }) => {
  const userId = user.uid;

  // ... (a lógica de busca permanece a mesma)

  return NextResponse.json([]);
});

// POST /api/lists
// Cria uma nova lista de tarefas.
export const POST = withAuth(async (request, { user }) => {
  const userId = user.uid;

  try {
    const { name } = await request.json();

    if (!name) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Name is required.' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const newList = await createList(name, userId);

    return new Response(JSON.stringify(newList), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error creating list:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to create list.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
});
