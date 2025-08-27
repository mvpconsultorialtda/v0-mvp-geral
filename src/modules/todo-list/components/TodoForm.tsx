"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X, Plus } from "lucide-react"
import type { Todo } from "../types"

interface TodoFormProps {
  todo?: Todo | null
  categories: string[]
  onSubmit: (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function TodoForm({ todo, categories, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [category, setCategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [showNewCategory, setShowNewCategory] = useState(false)

  useEffect(() => {
    if (todo) {
      setTitle(todo.title)
      setDescription(todo.description || "")
      setPriority(todo.priority)
      setCategory(todo.category || "")
      setDueDate(todo.dueDate ? todo.dueDate.toISOString().split("T")[0] : "")
    }
  }, [todo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const finalCategory = showNewCategory && newCategory.trim() ? newCategory.trim() : category

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category: finalCategory || undefined,
      completed: todo?.completed || false,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setPriority("medium")
    setCategory("")
    setNewCategory("")
    setDueDate("")
    setShowNewCategory(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{todo ? "Edit Todo" : "Add New Todo"}</h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo title..."
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description (optional)..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Category</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCategory(!showNewCategory)}>
              <Plus className="h-3 w-3 mr-1" />
              New Category
            </Button>
          </div>

          {showNewCategory ? (
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category..."
            />
          ) : (
            <Select value={category || "No Category"} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No Category">No Category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {todo ? "Update Todo" : "Add Todo"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
