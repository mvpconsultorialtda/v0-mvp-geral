
import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from "@/lib/db"; // Usando o módulo centralizado

/**
 * GET /api/tasks/[taskId]
 * Busca uma única tarefa pelo seu ID.
 */
export async function GET(req: NextRequest, { params }: { params: { taskId: string } }) {
    const { taskId } = params;
    const db = await readDb();

    // readDb garante que db.tasks exista.
    const task = db.tasks[taskId];

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
}

/**
 * PATCH /api/tasks/[taskId]
 * Atualiza uma tarefa específica.
 */
export async function PATCH(req: NextRequest, { params }: { params: { taskId: string } }) {
  const { taskId } = params;
  const db = await readDb();

  if (!db.tasks || !db.tasks[taskId]) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const body = await req.json();

  // Mescla a tarefa existente com os novos dados parciais.
  const updatedTask = {
    ...db.tasks[taskId],
    ...body,
    updatedAt: new Date().toISOString(), // Sempre atualiza o timestamp.
  };

  db.tasks[taskId] = updatedTask;
  await writeDb(db);

  return NextResponse.json(updatedTask);
}

/**
 * DELETE /api/tasks/[taskId]
 * Deleta uma tarefa específica.
 */
export async function DELETE(req: NextRequest, { params }: { params: { taskId: string } }) {
  const { taskId } = params;
  const db = await readDb();

  if (!db.tasks || !db.tasks[taskId]) {
    // A operação é idempotente. Se a tarefa não existe, o estado desejado (ausência da tarefa) já foi alcançado.
    // Retornar 204 é apropriado aqui.
    return new NextResponse(null, { status: 204 });
  }

  delete db.tasks[taskId];
  await writeDb(db);

  return new NextResponse(null, { status: 204 }); // 204 No Content é o padrão para um delete bem-sucedido.
}
