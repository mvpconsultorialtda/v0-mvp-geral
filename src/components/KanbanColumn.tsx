import React from 'react';
import { Task } from '../modules/task-lists/types';
import TaskCard from './TaskCard';
import { Droppable } from '@hello-pangea/dnd';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
}

// A coluna agora é uma área "soltável" que recebe e renderiza suas próprias tarefas.
const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, tasks }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 flex-shrink-0 w-80 flex flex-col">
      <h3 className="text-lg font-semibold text-black mb-4 px-2">{title}</h3>
      {/* O componente Droppable envolve a área onde os cartões podem ser soltos. */}
      <Droppable droppableId={title}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef} // Ref para a biblioteca de D&D gerenciar o DOM.
            {...provided.droppableProps} // Props para tornar a área soltável.
            className={`flex-1 space-y-4 transition-colors ${snapshot.isDraggingOver ? 'bg-gray-200' : ''}`}
          >
            {tasks.map((task, index) => (
              // O index é crucial para a biblioteca de D&D saber a ordem dos itens.
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder} {/* Espaço reservado que aparece enquanto um item é arrastado. */}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="text-sm text-gray-400 text-center py-4 h-full flex items-center justify-center">
                    Arraste tarefas para cá.
                </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
