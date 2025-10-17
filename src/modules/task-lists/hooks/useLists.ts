import { useEffect, useState } from 'react';
import { TaskList } from '../types';
import { createList, getLists } from '../services/task-lists.service';

export const useLists = () => {
  const [lists, setLists] = useState<TaskList[]>([]);

  useEffect(() => {
    const unsubscribe = getLists((fetchedLists) => {
      setLists(fetchedLists);
    });

    return () => unsubscribe();
  }, []);

  return {
    lists,
    createList,
  };
};
