'use client';

import { useState, useEffect } from 'react';
import { useTaskLists } from '../../src/modules/task-lists/hooks/useTaskLists';
import { useTasks } from '../../src/modules/task-lists/hooks/useTasks';
import { TaskList } from '../../src/modules/task-lists/types';
import { TaskListsSidebar } from '../../src/modules/task-lists/components/TaskListsSidebar';
import { TaskDetailView } from '../../src/modules/task-lists/components/TaskDetailView';

export default function TasksPage() {
  const [activeList, setActiveList] = useState<TaskList | null>(null);

  const { lists, isLoading: isLoadingLists, addList } = useTaskLists();
  const { tasks, isLoading: isLoadingTasks, addTask, updateTask, deleteTask } = useTasks(activeList?.id || null);

  // Efeito para definir a lista ativa quando as listas são carregadas
  useEffect(() => {
    // Apenas define a lista ativa se as listas foram carregadas e nenhuma lista ativa foi selecionada ainda.
    if (lists && lists.length > 0 && !activeList) {
      setActiveList(lists[0]);
    }
  }, [lists, activeList]); // O efeito depende das listas e da lista ativa

  if (isLoadingLists) {
    return <div>Carregando...</div>;
  }

  return (
    <main className="flex h-screen bg-white">
      <TaskListsSidebar
        lists={lists || []}
        activeList={activeList}
        onSelectList={setActiveList}
        onAddList={addList}
      />
      <TaskDetailView
        activeList={activeList}
        tasks={tasks || []}
        onAddTask={addTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </main>
  );
}
