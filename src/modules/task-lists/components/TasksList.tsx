'use client';

import { Task } from '../../types';
import { TaskItem } from './TaskItem';

interface TasksListProps {
  tasks: Task[] | undefined; // A propriedade pode ser indefinida durante o carregamento
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed' | 'status'>>) => void;
  onDeleteTask: (taskId:string) => void;
}

export const TasksList = ({ tasks, onUpdateTask, onDeleteTask }: TasksListProps) => {
  // Se as tarefas ainda não foram carregadas, exibe uma mensagem ou um spinner
  if (!tasks) {
    return <div className="text-center p-8">Carregando tarefas...</div>;
  }

  // Se não houver tarefas, exibe uma mensagem amigável
  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800">Nenhuma tarefa aqui!</h3>
        <p className="text-gray-500 mt-2">Adicione uma nova tarefa abaixo para começar.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onUpdateTask={onUpdateTask} 
          onDeleteTask={onDeleteTask} 
        />
      ))}
    </ul>
  );
};
