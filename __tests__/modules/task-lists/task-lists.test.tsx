import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TaskLists } from "@/modules/task-lists/components/task-lists";
import { TaskListProvider } from "@/modules/task-lists/hooks/use-task-lists";
import { TaskListService } from "@/modules/task-lists/services/task-list-service";
import { TaskList, Task } from "@/modules/task-lists/types/task-list";

jest.mock("@/modules/task-lists/services/task-list-service");

const mockTaskLists: TaskList[] = [
  {
    id: "1",
    name: "Test List",
    tasks: [{ id: "101", text: "Test Task", completed: false }],
  },
];

const mockService = TaskListService as jest.Mocked<typeof TaskListService>;

const renderComponent = () =>
  render(
    <TaskListProvider>
      <TaskLists />
    </TaskListProvider>
  );

describe("TaskLists", () => {
  beforeEach(() => {
    mockService.getTaskLists.mockResolvedValue(mockTaskLists);
    mockService.createTaskList.mockImplementation(async (name) => {
      const newList: TaskList = { id: "2", name, tasks: [] };
      return newList;
    });
    mockService.updateTaskList.mockResolvedValue();
    mockService.deleteTaskList.mockResolvedValue();
    mockService.createTask.mockImplementation(async (listId, text) => {
      const newTask: Task = { id: "102", text, completed: false };
      return newTask;
    });
    mockService.updateTask.mockResolvedValue();
    mockService.deleteTask.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render loading state initially", async () => {
    mockService.getTaskLists.mockImplementationOnce(
      () => new Promise(() => {})
    );
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("should render task lists", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Test List")).toBeInTheDocument();
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });
  });

  test("should create a new task list", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Test List")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Enter new list name"), {
      target: { value: "New List" },
    });
    fireEvent.click(screen.getByText("Create List"));

    await waitFor(() => {
      expect(mockService.createTaskList).toHaveBeenCalledWith("New List");
    });
  });

  test("should update a task list", async () => {
    renderComponent();
    await screen.findByText("Test List");

    fireEvent.click(screen.getByLabelText("Edit list Test List"));

    const input = await screen.findByDisplayValue("Test List");
    fireEvent.change(input, { target: { value: "Updated List" } });

    fireEvent.click(screen.getByLabelText("Save list Test List"));

    await waitFor(() => {
      expect(mockService.updateTaskList).toHaveBeenCalledWith("1", {
        id: "1",
        name: "Updated List",
        tasks: [{ id: "101", text: "Test Task", completed: false }],
      });
    });
  });

  test("should delete a task list", async () => {
    renderComponent();
    await screen.findByText("Test List");

    fireEvent.click(screen.getByLabelText("Delete list Test List"));

    await waitFor(() => {
      expect(mockService.deleteTaskList).toHaveBeenCalledWith("1");
    });
  });

  test("should create a new task", async () => {
    renderComponent();
    await screen.findByText("Test List");

    fireEvent.change(screen.getByPlaceholderText("Add a new task"), {
      target: { value: "New Task" },
    });
    fireEvent.click(screen.getByLabelText("Add task to Test List"));

    await waitFor(() => {
      expect(mockService.createTask).toHaveBeenCalledWith("1", "New Task");
    });
  });

  test("should update a task", async () => {
    renderComponent();
    await screen.findByText("Test Task");

    fireEvent.click(screen.getByLabelText("Edit task Test Task"));

    const input = await screen.findByDisplayValue("Test Task");
    fireEvent.change(input, { target: { value: "Updated Task" } });

    fireEvent.click(screen.getByLabelText("Save task Test Task"));

    await waitFor(() => {
      expect(mockService.updateTask).toHaveBeenCalledWith("1", "101", {
        id: "101",
        text: "Updated Task",
        completed: false,
      });
    });
  });

  test("should delete a task", async () => {
    renderComponent();
    await screen.findByText("Test Task");

    fireEvent.click(screen.getByLabelText("Delete task Test Task"));

    await waitFor(() => {
      expect(mockService.deleteTask).toHaveBeenCalledWith("1", "101");
    });
  });
});
