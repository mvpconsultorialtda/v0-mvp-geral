
// Define o status possível para um item de tarefa.
export type TodoStatus = "pending" | "in-progress" | "completed";

// Define a estrutura de um único item na lista de tarefas.
export interface TodoItem {
  id: string; // Identificador único da tarefa
  title: string; // Título da tarefa
  status: TodoStatus; // Status atual da tarefa
  description?: string; // Descrição opcional
}

// Define os níveis de permissão para acesso a uma lista de tarefas.
export type AccessPermission = "viewer" | "editor";

// Define a estrutura de uma lista de tarefas.
export interface TodoList {
  name: string; // Nome da lista de tarefas (ex: "Projeto Phoenix")
  ownerId: string; // ID do usuário que é o "dono" da lista
  
  // Controle de acesso para outros usuários.
  // A chave é o ID do usuário e o valor é o nível de permissão.
  accessControl: Record<string, AccessPermission>;

  // Array de tarefas pertencentes a esta lista.
  todos: TodoItem[];
}

// Estrutura do banco de dados da aplicação, mapeando IDs de lista para objetos TodoList.
export interface AppDatabase {
  todoLists: Record<string, TodoList>;
}
