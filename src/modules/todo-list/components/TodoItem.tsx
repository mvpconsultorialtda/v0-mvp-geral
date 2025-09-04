"use client"
import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Trash2, Edit, Calendar, Clock } from "lucide-react"
import type { Todo, TodoStatus } from "../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

interface TodoItemProps {
  todo: Todo
  onStatusChange: (id: string, status: TodoStatus) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
}

export function TodoItem({ todo, onStatusChange, onDelete, onEdit }: TodoItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: TodoStatus) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const isOverdue = todo.dueDate && new Date() > todo.dueDate && todo.status !== "completed"

  return (
    <Card
      className={`p-4 transition-all duration-200 ${
        todo.status === "completed" ? "opacity-60 bg-muted/30" : ""
      } ${isHovered ? "shadow-md" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-medium text-sm ${todo.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
              {todo.title}
            </h3>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className={`text-xs ${getPriorityColor(todo.priority)}`}>
                {todo.priority === 'high' ? 'alta' : todo.priority === 'medium' ? 'média' : 'baixa'}
              </Badge>
              {isHovered && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(todo)} className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(todo.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {todo.description && (
            <p className={`text-xs text-muted-foreground mb-2 ${todo.status === "completed" ? "line-through" : ""}`}>
              {todo.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
            <Select value={todo.status} onValueChange={(value: TodoStatus) => onStatusChange(todo.id, value)}>
              <SelectTrigger className={`text-xs h-7 ${getStatusColor(todo.status)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>

            {todo.category && (
              <Badge variant="secondary" className="text-xs">
                {todo.category}
              </Badge>
            )}

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(todo.createdAt)}
            </div>

            {todo.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : ""}`}>
                <Calendar className="h-3 w-3" />
                {formatDate(todo.dueDate)}
                {isOverdue && <span className="text-red-600 font-medium">Atrasada</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
