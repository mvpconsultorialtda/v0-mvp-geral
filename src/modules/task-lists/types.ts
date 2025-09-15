export interface TaskList {
  id: string;
  name: string;
}

// A Task agora tem um status para suportar a visualização Kanban.
export type TaskStatus = 'A Fazer' | 'Em Andamento' | 'Concluído';

export interface Task {
  id: string;
  listId: string;
  text: string;
  completed: boolean; // Manter por enquanto para compatibilidade
  status: TaskStatus;
}
