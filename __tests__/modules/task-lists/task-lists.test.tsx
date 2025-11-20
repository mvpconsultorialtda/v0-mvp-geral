import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskLists } from "@/modules/task-lists/components/task-lists";
import { useTaskList } from "@/modules/task-lists/hooks/use-task-lists";
import { Task, KanbanColumn } from "@/modules/task-lists/types/task-list";
import { Workspace, Board } from "@/modules/task-lists/types/workspace";

// Mock the hook
jest.mock("@/modules/task-lists/hooks/use-task-lists");

const mockUseTaskList = useTaskList as jest.Mock;

describe("TaskLists (Kanban Board with Hierarchy)", () => {
  const mockWorkspaces: Workspace[] = [
    { id: "w1", name: "My Workspace", ownerId: "u1", createdAt: "2023-01-01" },
  ];

  const mockBoards: Board[] = [
    { id: "b1", workspaceId: "w1", name: "Project Alpha", createdAt: "2023-01-01" },
  ];

  const mockColumns: KanbanColumn[] = [
    { id: "col1", boardId: "b1", title: "To Do", order: 0 },
    { id: "col2", boardId: "b1", title: "Done", order: 1 },
  ];

  const mockTasks: Task[] = [
    { id: "t1", columnId: "col1", text: "Task 1", completed: false, order: 0 },
    { id: "t2", columnId: "col2", text: "Task 2", completed: true, order: 0 },
  ];

  const mockBoardData = {
    columns: {
      col1: { id: "col1", title: "To Do", order: 0, tasks: [mockTasks[0]] },
      col2: { id: "col2", title: "Done", order: 1, tasks: [mockTasks[1]] },
    },
    columnOrder: ["col1", "col2"],
  };

  const mockActions = {
    createWorkspace: jest.fn(),
    deleteWorkspace: jest.fn(),
    createBoard: jest.fn(),
    deleteBoard: jest.fn(),
    createColumn: jest.fn(),
    updateColumn: jest.fn(),
    deleteColumn: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    moveTask: jest.fn(),
    setSelectedWorkspaceId: jest.fn(),
    setSelectedBoardId: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskList.mockReturnValue({
      workspaces: mockWorkspaces,
      boards: mockBoards,
      boardData: mockBoardData,
      loading: false,
      error: null,
      selectedWorkspaceId: "w1",
      selectedBoardId: "b1",
      ...mockActions,
    });
  });

  it("renders the sidebar with workspaces and boards", () => {
    render(<TaskLists />);
    expect(screen.getByText("My Workspace")).toBeInTheDocument();
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
  });

  it("renders the selected board name in header", async () => {
    render(<TaskLists />);
    fireEvent.click(screen.getByText("Project Alpha"));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Project Alpha" })).toBeInTheDocument();
    });
  });

  it("renders columns and tasks for the selected board", async () => {
    render(<TaskLists />);
    fireEvent.click(screen.getByText("Project Alpha"));

    await waitFor(() => {
      expect(screen.getByText("To Do")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });
  });

  it("calls createColumn when adding a new column (list)", async () => {
    render(<TaskLists />);
    fireEvent.click(screen.getByText("Project Alpha"));

    // Click "Add another column"
    await waitFor(() => screen.getByText("Add another column"));
    fireEvent.click(screen.getByText("Add another column"));

    const input = screen.getByPlaceholderText("Enter column title...");
    fireEvent.change(input, { target: { value: "New Column" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(mockActions.createColumn).toHaveBeenCalledWith("b1", "New Column");
    });
  });

  it("calls createTask when adding a new task", async () => {
    render(<TaskLists />);
    fireEvent.click(screen.getByText("Project Alpha"));

    await waitFor(() => screen.getByText("To Do"));

    // Find the input in the first column
    const inputs = screen.getAllByPlaceholderText("+ Add a task");
    const input = inputs[0];

    fireEvent.change(input, { target: { value: "New Task" } });

    // Find the "Add" button (using aria-label)
    const submitButton = screen.getByLabelText("Add task to To Do");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockActions.createTask).toHaveBeenCalledWith("col1", "New Task");
    });
  });

  it("opens task details modal on task click", async () => {
    render(<TaskLists />);
    fireEvent.click(screen.getByText("Project Alpha"));

    await waitFor(() => screen.getByText("Task 1"));

    fireEvent.click(screen.getByText("Task 1"));
    expect(screen.getByText("Task Details")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Task 1")).toBeInTheDocument();
  });
});
