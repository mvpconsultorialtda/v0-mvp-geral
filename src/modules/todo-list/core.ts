
import fs from "fs";
import path from "path";

// The path to the JSON file is determined relative to the current working directory
const filePath = path.resolve(process.cwd(), "data/todos.json");

/**
 * Reads the entire todo list data structure from the JSON file.
 * If the file or directory doesn't exist, it returns a default initial state.
 * @returns The parsed data from the JSON file or a default structure.
 */
export function readTodoListData() {
  try {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Read the file
    const jsonData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    // If the file does not exist, return a default structure
    return { todos: [], categories: [], lastUpdated: new Date().toISOString() };
  }
}

/**
 * Writes the entire todo list data structure to the JSON file.
 * @param data - The data object to be serialized and written to the file.
 */
export function writeTodoListData(data: any) {
  try {
    // Ensure the directory exists before writing
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    // In a real app, you'd want more robust error handling here
    console.error("Error writing data:", error);
  }
}
