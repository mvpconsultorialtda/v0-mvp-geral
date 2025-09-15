import React from 'react';
import { Task } from '../modules/task-lists/types';

interface TaskCardProps {
  task: Task;
}

// Componente para renderizar um card de tarefa no quadro Kanban.
const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <p className="text-sm text-gray-800">{task.text}</p>
    </div>
  );
};

export default TaskCard;
