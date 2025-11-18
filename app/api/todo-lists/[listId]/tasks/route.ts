
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { getTodoListById, createTask } from '@/modules/todo-list/core.server';

export async function POST(request: Request, { params }: { params: { listId: string } }) {
  const session = await verifySession();
  if (!session) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  const list = await getTodoListById(params.listId);
  if (list.ownerId !== session.uid) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Forbidden' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }

  const { title } = await request.json();
  const task = await createTask(params.listId, title);

  return NextResponse.json(task, { status: 201 });
}
