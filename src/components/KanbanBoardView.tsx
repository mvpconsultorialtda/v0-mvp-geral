'use client';

import { useMemo, useState } from 'react';
import { Task, TaskStatus } from '../modules/task-lists/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskDetailModal } from '../modules/task-lists/components/TaskDetailModal';

interface KanbanBoardViewProps {
  tasks: Task[] | undefined;
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed' | 'status'>>) => void;
}

const KanbanBoardView = ({ tasks, onUpdateTask }: KanbanBoardViewProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const columns: TaskStatus[] = ['Pendente', 'Em Andamento', 'Concluído'];

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] || []}
            onUpdateTask={onUpdateTask}
            onSelectTask={handleSelectTask}
          />
        ))}
      </div>
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          listId={selectedTask.listId}
          isOpen={!!selectedTask}
          onClose={handleCloseModal}
          onUpdateTask={(updates) => onUpdateTask(selectedTask.id, updates)}
        />
      )}
    </>
  );
};

export default KanbanBoardView;
