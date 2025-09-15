import React from 'react';
import { Task } from '../modules/task-lists/types';
import { Draggable } from '@hello-pangea/dnd';

interface TaskCardProps {
  task: Task;
  index: number; // O index é necessário para o Draggable.
}

// O cartão de tarefa agora é um item "arrastável".
const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef} // Ref para o D&D gerenciar o DOM.
          {...provided.draggableProps} // Props para tornar o item arrastável.
          {...provided.dragHandleProps} // Props para o "pegador" (o próprio cartão).
          className={`bg-white rounded-md shadow-sm p-4 border border-gray-200 hover:shadow-lg transition-all cursor-grab ${snapshot.isDragging ? 'shadow-xl' : ''}`}
        >
          <p className="text-sm text-gray-800">{task.text}</p>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
