import { type NextRequest, NextResponse } from "next/server"

let todosData = {
  todos: [],
  categories: [],
  lastUpdated: new Date().toISOString(),
}

export async function GET() {
  try {
    console.log("[v0] GET /api/todos - returning data:", todosData)
    return NextResponse.json(todosData)
  } catch (error) {
    console.error("[v0] Error in GET /api/todos:", error)
    return NextResponse.json({ error: "Failed to read todos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    data.lastUpdated = new Date().toISOString()

    todosData = data

    console.log("[v0] POST /api/todos - saved data:", todosData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in POST /api/todos:", error)
    return NextResponse.json({ error: "Failed to save todos" }, { status: 500 })
  }
}
