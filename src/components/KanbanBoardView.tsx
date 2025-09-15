'use client';

import { useMemo } from 'react';
import { Task, TaskStatus } from '../../modules/types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardViewProps {
  tasks: Task[] | undefined; // A propriedade pode ser indefinida durante o carregamento
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed' | 'status'>>) => void;
}

const KanbanBoardView = ({ tasks, onUpdateTask }: KanbanBoardViewProps) => {
  // Define as colunas do quadro Kanban
  const columns: TaskStatus[] = ['Pendente', 'Em Andamento', 'Concluído'];

  // O useMemo agora verifica se as tarefas existem antes de processá-las
  const tasksByStatus = useMemo(() => {
    if (!tasks) { // Se as tarefas não foram carregadas, retorna um objeto vazio
      return {};
    }
    // Agrupa as tarefas por status
    return tasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  // Se as tarefas ainda não foram carregadas, exibe uma mensagem
  if (!tasks) {
    return <div className="text-center p-8">Carregando tarefas...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasksByStatus[status] || []} // Garante que um array seja sempre passado
          onUpdateTask={onUpdateTask}
        />
      ))}
    </div>
  );
};

export default KanbanBoardView;
