'use client';

import React from 'react';
import { Task, TaskStatus } from '../modules/task-lists/types';
import KanbanColumn from './KanbanColumn';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

interface KanbanBoardViewProps {
  tasks: Task[];
  // A função para atualizar a tarefa é essencial para o drag-and-drop.
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'status'>>) => void;
}

// O quadro Kanban agora gerencia o contexto de arrastar e soltar.
const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({ tasks, onUpdateTask }) => {

  // Esta função é chamada quando uma tarefa é solta.
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se não houver destino (solto fora de uma coluna), não faz nada.
    if (!destination) {
      return;
    }

    // Se a tarefa for solta na mesma posição em que começou, não faz nada.
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // O ID da coluna de destino é o novo status da tarefa.
    const newStatus = destination.droppableId as TaskStatus;

    // Chama a função de atualização para persistir a mudança de status.
    onUpdateTask(draggableId, { status: newStatus });
  };

  // Filtra e agrupa as tarefas por status.
  const columns: Record<TaskStatus, Task[]> = {
    'A Fazer': tasks.filter(t => t.status === 'A Fazer'),
    'Em Andamento': tasks.filter(t => t.status === 'Em Andamento'),
    'Concluído': tasks.filter(t => t.status === 'Concluído'),
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-6 overflow-x-auto p-4 h-full">
        {(Object.keys(columns) as TaskStatus[]).map(status => (
          // Passa as tarefas filtradas para cada coluna.
          <KanbanColumn key={status} title={status} tasks={columns[status]} />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoardView;
