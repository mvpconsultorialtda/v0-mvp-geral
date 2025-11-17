
'use client';

import { Task, TaskStatus } from '../modules/task-lists/types';
import TaskCard from './TaskCard';
import { Droppable } from '@hello-pangea/dnd';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onSelectTask: (task: Task) => void;
}

export const KanbanColumn = ({ status, tasks, onSelectTask }: KanbanColumnProps) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 h-full flex flex-col">
      <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">
        {status}
      </h3>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 overflow-y-auto flex-1 ${snapshot.isDraggingOver ? 'bg-gray-200' : ''}`}
          >
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <div key={task.id} onClick={() => onSelectTask(task)}>
                  <TaskCard task={task} index={index} />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm p-4 text-center">Nenhuma tarefa aqui.</p>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
