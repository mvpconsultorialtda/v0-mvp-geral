
import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from "@/lib/db"; // Usando o módulo centralizado

/**
 * GET /api/todo-lists/[listId]/tasks
 * Busca todas as tarefas para uma lista de tarefas específica.
 */
export async function GET(req: NextRequest, { params }: { params: { listId: string } }) {
  const { listId } = params;
  const db = await readDb();

  // A função readDb garante que db.todoLists exista, então essa verificação é segura.
  if (!db.todoLists[listId]) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  // readDb garante que db.tasks exista. Se não houver tarefas, Object.values retornará [].
  const tasksForList = Object.values(db.tasks).filter((task: any) => task.listId === listId);

  return NextResponse.json(tasksForList);
}

/**
 * POST /api/todo-lists/[listId]/tasks
 * Cria uma nova tarefa para uma lista de tarefas específica.
 */
export async function POST(req: NextRequest, { params }: { params: { listId: string } }) {
  const { listId } = params;
  const db = await readDb();

  if (!db.todoLists[listId]) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  const body = await req.json();
  const { title } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const newTaskId = `task_${Date.now()}`;
  const newTask = {
    id: newTaskId,
    listId,
    title,
    status: 'pending', // Status padrão
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // outros campos podem ser adicionados aqui a partir do body
    ...body,
  };

  db.tasks[newTaskId] = newTask;
  await writeDb(db);

  // Retorna o objeto completo da nova tarefa, garantindo que o cliente tenha todos os dados.
  return NextResponse.json(newTask, { status: 201 });
}
