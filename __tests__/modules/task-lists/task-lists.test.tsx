import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { TaskLists } from '@/modules/task-lists/components/task-lists';
import { TaskListService } from '@/modules/task-lists/services/task-list-service';
import { useTaskList } from '@/modules/task-lists/hooks/use-task-lists';
import userEvent from '@testing-library/user-event';

// Mock the hook directly to control the data state easily
jest.mock('@/modules/task-lists/hooks/use-task-lists');

const mockUseTaskList = useTaskList as jest.Mock;

describe('TaskLists Component (Kanban Board)', () => {
  const mockCreateColumn = jest.fn();
  const mockUpdateColumn = jest.fn();
  const mockDeleteColumn = jest.fn();
  const mockCreateTask = jest.fn();
  const mockUpdateTask = jest.fn();
  const mockDeleteTask = jest.fn();
  const mockMoveTask = jest.fn();

  const defaultHookReturn = {
    boardData: { columns: {}, columnOrder: [] },
    loading: false,
    error: null,
    createColumn: mockCreateColumn,
    updateColumn: mockUpdateColumn,
    deleteColumn: mockDeleteColumn,
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    moveTask: mockMoveTask,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskList.mockReturnValue(defaultHookReturn);
  });

  it('renders loading state', () => {
    mockUseTaskList.mockReturnValue({ ...defaultHookReturn, loading: true });
    render(<TaskLists />);
    expect(screen.getByLabelText('Loading task lists')).toBeInTheDocument();
  });

  it('renders empty state (add list button)', () => {
    render(<TaskLists />);
    expect(screen.getByText('Add another list')).toBeInTheDocument();
  });

  it('renders columns and tasks', () => {
    const mockData = {
      columns: {
        'col-1': { id: 'col-1', title: 'To Do', order: 0, tasks: [{ id: 'task-1', columnId: 'col-1', text: 'Task 1', completed: false, order: 0 }] },
        'col-2': { id: 'col-2', title: 'Done', order: 1, tasks: [] }
      },
      columnOrder: ['col-1', 'col-2']
    };

    mockUseTaskList.mockReturnValue({ ...defaultHookReturn, boardData: mockData });
    render(<TaskLists />);

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('allows creating a new list (column)', async () => {
    const user = userEvent.setup();
    render(<TaskLists />);

    await user.click(screen.getByText('Add another list'));
    const input = screen.getByPlaceholderText('Enter list title...');
    await user.type(input, 'New Column');
    await user.click(screen.getByText('Add List'));

    expect(mockCreateColumn).toHaveBeenCalledWith('New Column');
  });

  it('allows deleting a list', async () => {
    const mockData = {
      columns: {
        'col-1': { id: 'col-1', title: 'To Do', order: 0, tasks: [] }
      },
      columnOrder: ['col-1']
    };
    mockUseTaskList.mockReturnValue({ ...defaultHookReturn, boardData: mockData });

    const user = userEvent.setup();
    render(<TaskLists />);

    const deleteBtn = screen.getByLabelText('Delete list To Do');
    await user.click(deleteBtn);

    expect(mockDeleteColumn).toHaveBeenCalledWith('col-1');
  });

  it('allows creating a task in a column', async () => {
    const mockData = {
      columns: {
        'col-1': { id: 'col-1', title: 'To Do', order: 0, tasks: [] }
      },
      columnOrder: ['col-1']
    };
    mockUseTaskList.mockReturnValue({ ...defaultHookReturn, boardData: mockData });

    const user = userEvent.setup();
    render(<TaskLists />);

    const input = screen.getByPlaceholderText('+ Add a task');
    await user.type(input, 'New Task');

    const addBtn = screen.getByLabelText('Add task to To Do');
    await user.click(addBtn);

    expect(mockCreateTask).toHaveBeenCalledWith('col-1', 'New Task');
  });

  it('allows deleting a task', async () => {
    const mockData = {
      columns: {
        'col-1': { id: 'col-1', title: 'To Do', order: 0, tasks: [{ id: 'task-1', columnId: 'col-1', text: 'Task 1', completed: false, order: 0 }] }
      },
      columnOrder: ['col-1']
    };
    mockUseTaskList.mockReturnValue({ ...defaultHookReturn, boardData: mockData });

    const user = userEvent.setup();
    render(<TaskLists />);

    const deleteBtn = screen.getByLabelText('Delete task Task 1');
    await user.click(deleteBtn);

    expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
  });
});
