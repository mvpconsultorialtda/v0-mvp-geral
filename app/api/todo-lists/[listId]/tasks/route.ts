
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data', 'db.json');

// Helper function to read the database
async function readDb() {
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist, return a default structure
    return { todoLists: {}, tasks: {} };
  }
}

// Helper function to write to the database
async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

/**
 * GET /api/todo-lists/[listId]/tasks
 * Fetches all tasks for a specific todo list.
 */
export async function GET(req: NextRequest, { params }: { params: { listId: string } }) {
  const { listId } = params;
  const db = await readDb();

  if (!db.todoLists[listId]) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  const tasksForList = Object.values(db.tasks).filter((task: any) => task.listId === listId);

  return NextResponse.json(tasksForList);
}

/**
 * POST /api/todo-lists/[listId]/tasks
 * Creates a new task for a specific todo list.
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
    status: 'pending', // Default status
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tasks[newTaskId] = newTask;
  await writeDb(db);

  return NextResponse.json(newTask, { status: 201 });
}
