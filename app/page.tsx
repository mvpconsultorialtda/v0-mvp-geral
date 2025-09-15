'use client';

import { useState } from 'react';
import { useTaskLists } from '../src/modules/task-lists/hooks/useTaskLists';
import { useTasks } from '../src/modules/task-lists/hooks/useTasks';
import { TaskList } from '../src/modules/task-lists/types';
import { TaskListsSidebar } from '../src/modules/task-lists/components/TaskListsSidebar';
import { TaskDetailView } from '../src/modules/task-lists/components/TaskDetailView';

export default function Home() {
  const [activeList, setActiveList] = useState<TaskList | null>(null);

  const { lists, isLoading: isLoadingLists, addList } = useTaskLists();
  const { tasks, isLoading: isLoadingTasks, addTask, updateTask, deleteTask } = useTasks(activeList?.id || null);

  // Define um estado inicial para activeList assim que as listas são carregadas
  if (lists && !activeList) {
    setActiveList(lists[0]);
  }

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
