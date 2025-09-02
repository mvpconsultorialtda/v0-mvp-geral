"use client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import type { TodoFilter } from "../types"

interface TodoFiltersProps {
  filter: TodoFilter
  categories: string[]
  onFilterChange: (filter: TodoFilter) => void
  onClearFilters: () => void
}

export function TodoFilters({ filter, categories, onFilterChange, onClearFilters }: TodoFiltersProps) {
  const hasActiveFilters = filter.status !== "all" || filter.priority || filter.category || filter.search

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros</span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tarefas..."
          value={filter.search || ""}
          onChange={(e) => onFilterChange({ ...filter, search: e.target.value || undefined })}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Select
            value={filter.status}
            onValueChange={(value: "all" | "completed" | "pending") => onFilterChange({ ...filter, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Tarefas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filter.priority || "none"}
            onValueChange={(value) => onFilterChange({ ...filter, priority: value === "none" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as Prioridades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Todas as Prioridades</SelectItem>
              <SelectItem value="high">Prioridade Alta</SelectItem>
              <SelectItem value="medium">Prioridade Média</SelectItem>
              <SelectItem value="low">Prioridade Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={filter.category || "none"}
            onValueChange={(value) => onFilterChange({ ...filter, category: value === "none" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Todas as Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filter.status !== "all" && (
            <Badge variant="secondary">
              Status: {filter.status === 'pending' ? 'Pendente' : 'Concluído'}
              <button
                onClick={() => onFilterChange({ ...filter, status: "all" })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filter.priority && (
            <Badge variant="secondary">
              Prioridade: {filter.priority === 'high' ? 'Alta' : filter.priority === 'medium' ? 'Média' : 'Baixa'}
              <button
                onClick={() => onFilterChange({ ...filter, priority: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filter.category && (
            <Badge variant="secondary">
              Categoria: {filter.category}
              <button
                onClick={() => onFilterChange({ ...filter, category: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
