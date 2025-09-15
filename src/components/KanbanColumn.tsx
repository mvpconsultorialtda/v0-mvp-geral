'use client';

import { Task, TaskStatus } from '../modules/types';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed' | 'status'>>) => void;
}

// Exportando o componente para que ele possa ser importado em outros arquivos
export const KanbanColumn = ({ status, tasks }: KanbanColumnProps) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 h-full flex flex-col">
      {/* Título da coluna */}
      <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">
        {status}
      </h3>
      
      {/* Container para as tarefas com rolagem */}
      <div className="space-y-3 overflow-y-auto flex-1">
        {tasks.length > 0 ? (
          tasks.map(task => (
            // Cada tarefa é um cartão
            <div key={task.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
              <p className="text-gray-900 text-sm">{task.text}</p>
            </div>
          ))
        ) : (
          // Mensagem exibida quando não há tarefas na coluna
          <div className="flex items-center justify-center h-full">
             <p className="text-gray-500 text-sm p-4 text-center">Nenhuma tarefa aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
