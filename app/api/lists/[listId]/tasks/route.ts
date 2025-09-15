import { NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/firebase/admin';

// GET /api/lists/[listId]/tasks
// Obtém as tarefas de uma lista específica.
export async function GET(request: Request, { params }: { params: { listId: string } }) {
  const { listId } = params;
  // TODO: Validar o acesso do usuário à lista (listId) antes de retornar as tarefas.

  try {
    const tasksSnapshot = await adminDb.collection('tasks').where('listId', '==', listId).orderBy('order').get();
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for list ${listId}:`, error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to fetch tasks.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

// POST /api/lists/[listId]/tasks
// Cria uma nova tarefa em uma lista específica.
export async function POST(request: Request, { params }: { params: { listId: string } }) {
  const { listId } = params;
  // TODO: Validar o acesso do usuário à lista (listId) antes de criar a tarefa.

  try {
    const { text, order } = await request.json();

    if (!text || order === undefined) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Text and order are required.' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const newTask = {
      listId,
      text,
      completed: false,
      order,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('tasks').add(newTask);

    return NextResponse.json({ id: docRef.id, ...newTask }, { status: 201 });
  } catch (error) {
    console.error(`Error creating task for list ${listId}:`, error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to create task.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
