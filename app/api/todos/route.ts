import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const todosFilePath = path.join(process.cwd(), "data", "todos.json")

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Ensure todos.json exists
async function ensureTodosFile() {
  try {
    await fs.access(todosFilePath)
  } catch {
    const initialData = {
      todos: [],
      categories: [],
      lastUpdated: new Date().toISOString(),
    }
    await fs.writeFile(todosFilePath, JSON.stringify(initialData, null, 2))
  }
}

export async function GET() {
  try {
    await ensureDataDirectory()
    await ensureTodosFile()

    const fileContents = await fs.readFile(todosFilePath, "utf8")
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error reading todos:", error)
    return NextResponse.json({ error: "Failed to read todos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataDirectory()
    await ensureTodosFile()

    const data = await request.json()
    data.lastUpdated = new Date().toISOString()

    await fs.writeFile(todosFilePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving todos:", error)
    return NextResponse.json({ error: "Failed to save todos" }, { status: 500 })
  }
}
