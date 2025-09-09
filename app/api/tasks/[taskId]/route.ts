
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data', 'db.json');

// Helper functions to read and write the database (can be refactored into a shared module)
async function readDb() {
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return { todoLists: {}, tasks: {} };
  }
}

async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

/**
 * GET /api/tasks/[taskId]
 * Fetches a single task by its ID.
 */
export async function GET(req: NextRequest, { params }: { params: { taskId: string } }) {
    const { taskId } = params;
    const db = await readDb();

    const task = db.tasks[taskId];

    if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
}

/**
 * PATCH /api/tasks/[taskId]
 * Updates a specific task.
 */
export async function PATCH(req: NextRequest, { params }: { params: { taskId: string } }) {
  const { taskId } = params;
  const db = await readDb();

  if (!db.tasks[taskId]) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const body = await req.json();

  // Merge existing task with the new partial data
  const updatedTask = {
    ...db.tasks[taskId],
    ...body,
    updatedAt: new Date().toISOString(), // Always update the timestamp
  };

  db.tasks[taskId] = updatedTask;
  await writeDb(db);

  return NextResponse.json(updatedTask);
}

/**
 * DELETE /api/tasks/[taskId]
 * Deletes a specific task.
 */
export async function DELETE(req: NextRequest, { params }: { params: { taskId: string } }) {
  const { taskId } = params;
  const db = await readDb();

  if (!db.tasks[taskId]) {
    // It's idempotent, so returning 200 or 204 is also fine if it doesn't exist.
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  delete db.tasks[taskId];
  await writeDb(db);

  return new NextResponse(null, { status: 204 }); // 204 No Content is standard for a successful delete
}
