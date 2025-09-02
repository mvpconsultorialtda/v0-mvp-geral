
import { NextRequest, NextResponse } from "next/server";
import {
  readTodoListData,
  writeTodoListData,
} from "@/src/modules/todo-list/core"; // The business logic

/**
 * API route for retrieving the entire todo list data.
 * It delegates the data fetching to the core todo-list module.
 */
export async function GET() {
  try {
    const data = readTodoListData();
    return NextResponse.json(data);
  } catch (error) {
    // The core module handles the error logging, but we send a generic response
    return NextResponse.json({ message: "Error reading data" }, { status: 500 });
  }
}

/**
 * API route for saving the entire todo list data.
 * It delegates the data writing to the core todo-list module.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    writeTodoListData(data);
    return NextResponse.json({ message: "Data saved successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error saving data" }, { status: 500 });
  }
}
