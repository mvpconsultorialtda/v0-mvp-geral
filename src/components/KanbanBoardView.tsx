
'use client';

import { useMemo, useState } from 'react';
import { Task, TaskStatus, taskStatuses } from '../modules/task-lists/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskDetailModal } from '../modules/task-lists/components/TaskDetailModal';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

interface KanbanBoardViewProps {
  tasks: Task[] | undefined;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const KanbanBoardView = ({ tasks, onUpdateTask }: KanbanBoardViewProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasksByStatus = useMemo(() => {
    if (!tasks) {
      return {};
    }
    return tasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  const handleOnDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = tasksByStatus[source.droppableId as TaskStatus];
    const endColumn = tasksByStatus[destination.droppableId as TaskStatus];
    const task = startColumn.find(t => t.id === draggableId);

    if (task) {
      onUpdateTask(task.id, { status: destination.droppableId as TaskStatus });
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  if (!tasks) {
    return <div className="text-center p-8">Carregando tarefas...</div>;
  }

  return (
    <>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {taskStatuses.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status] || []}
              onUpdateTask={onUpdateTask}
              onSelectTask={handleSelectTask}
            />
          ))}
        </div>
      </DragDropContext>
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          listId={selectedTask.listId}
          isOpen={!!selectedTask}
          onClose={handleCloseModal}
          onUpdateTask={(taskId, updates) => onUpdateTask(taskId, updates)}
        />
      )}
    </>
  );
};

export default KanbanBoardView;
