import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase-admin";

const TODOS_COLLECTION = 'todos';
const TODOS_DOCUMENT = 'main';

export async function GET() {
  try {
    const docRef = db.collection(TODOS_COLLECTION).doc(TODOS_DOCUMENT);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log("[v1] GET /api/todos - No data in Firestore, returning default.");
      return NextResponse.json({
        todos: [],
        categories: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    const todosData = doc.data();
    console.log("[v1] GET /api/todos - returning data from Firestore");
    return NextResponse.json(todosData);
  } catch (error) {
    console.error("[v1] Error in GET /api/todos:", error);
    return NextResponse.json({ error: "Failed to read todos from Firestore" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    data.lastUpdated = new Date().toISOString();

    const docRef = db.collection(TODOS_COLLECTION).doc(TODOS_DOCUMENT);
    await docRef.set(data);

    console.log("[v1] POST /api/todos - saved data to Firestore");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v1] Error in POST /api/todos:", error);
    return NextResponse.json({ error: "Failed to save todos to Firestore" }, { status: 500 });
  }
}
