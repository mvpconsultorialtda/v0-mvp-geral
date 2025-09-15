import React from 'react';
import { Task, TaskStatus } from '../modules/task-lists/types';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

interface KanbanBoardViewProps {
  tasks: Task[];
}

// Componente que organiza as colunas e os cards para formar o quadro Kanban.
const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({ tasks }) => {

  // Filtra as tarefas para cada coluna com base no status.
  const columns: Record<TaskStatus, Task[]> = {
    'A Fazer': tasks.filter(t => t.status === 'A Fazer'),
    'Em Andamento': tasks.filter(t => t.status === 'Em Andamento'),
    'Concluído': tasks.filter(t => t.status === 'Concluído'),
  };

  return (
    <div className="flex space-x-6 overflow-x-auto p-4">
      {(Object.keys(columns) as TaskStatus[]).map(status => (
        <KanbanColumn key={status} title={status}>
          {columns[status].length > 0 ? (
            columns[status].map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">Nenhuma tarefa aqui.</div>
          )}
        </KanbanColumn>
      ))}
    </div>
  );
};

export default KanbanBoardView;
