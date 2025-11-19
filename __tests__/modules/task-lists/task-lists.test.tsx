import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskLists } from "@/modules/task-lists/components/task-lists";
import { TaskListService } from "@/modules/task-lists/services/task-list-service";
import { TaskList } from "@/modules/task-lists/types/task-list";
import { SWRConfig } from "swr";
import "@testing-library/jest-dom";

// Mock the service
jest.mock("@/modules/task-lists/services/task-list-service");

const mockTaskLists: TaskList[] = [
  {
    id: "1",
    name: "Test List",
    tasks: [
      { id: "101", text: "Task 1", completed: false },
      { id: "102", text: "Task 2", completed: true },
    ],
  },
];

const mockService = TaskListService as jest.Mocked<typeof TaskListService>;

// Wrapper with SWR Config to clear cache between tests
const renderComponent = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <TaskLists />
    </SWRConfig>
  );

describe("TaskLists Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading and Empty States", () => {
    it("should show loading state initially", () => {
      mockService.getTaskLists.mockReturnValue(new Promise(() => { })); // Never resolves
      renderComponent();
      expect(screen.getByLabelText("Loading task lists")).toBeInTheDocument();
    });

    it("should show empty state when no lists exist", async () => {
      mockService.getTaskLists.mockResolvedValue([]);
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByLabelText("Loading task lists")).not.toBeInTheDocument();
      });

      expect(screen.getByText("Task Lists")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter new list name")).toBeInTheDocument();
    });

    it("should handle error state", async () => {
      mockService.getTaskLists.mockRejectedValue(new Error("Failed to fetch"));
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Error loading task lists.")).toBeInTheDocument();
      });
    });
  });

  describe("List Management", () => {
    it("should render existing task lists", async () => {
      mockService.getTaskLists.mockResolvedValue(mockTaskLists);
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test List")).toBeInTheDocument();
      });
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });

    it("should create a new task list", async () => {
      const user = userEvent.setup();
      mockService.getTaskLists.mockResolvedValue([]);
      mockService.createTaskList.mockResolvedValue({
        id: "2",
        name: "New List",
        tasks: [],
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter new list name")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("Enter new list name");
      const button = screen.getByText("Create List");

      await user.type(input, "New List");
      await user.click(button);

      await waitFor(() => {
        expect(mockService.createTaskList).toHaveBeenCalledWith("New List");
      });
    });

    it("should delete a task list", async () => {
      const user = userEvent.setup();
      mockService.getTaskLists.mockResolvedValue(mockTaskLists);
      mockService.deleteTaskList.mockResolvedValue();

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test List")).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText("Delete list Test List");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockService.deleteTaskList).toHaveBeenCalledWith("1");
      });
    });
  });

  describe("Task Management", () => {
    it("should create a new task", async () => {
      const user = userEvent.setup();
      mockService.getTaskLists.mockResolvedValue(mockTaskLists);
      mockService.createTask.mockResolvedValue({
        id: "103",
        text: "New Task",
        completed: false,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Test List")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("Add a new task");
      const addButton = screen.getByLabelText("Add task to Test List");

      await user.type(input, "New Task");
      await user.click(addButton);

      await waitFor(() => {
        expect(mockService.createTask).toHaveBeenCalledWith("1", "New Task");
      });
    });

    it("should update a task (toggle completion)", async () => {
      const user = userEvent.setup();
      mockService.getTaskLists.mockResolvedValue(mockTaskLists);
      mockService.updateTask.mockResolvedValue();

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Task 1")).toBeInTheDocument();
      });

      // Find the checkbox for Task 1
      const taskItem = screen.getByText("Task 1").closest("li");
      const checkbox = taskItem?.querySelector('input[type="checkbox"]');

      if (checkbox) {
        await user.click(checkbox);
        await waitFor(() => {
          expect(mockService.updateTask).toHaveBeenCalledWith(
            "1",
            "101",
            expect.objectContaining({
              completed: true,
            })
          );
        });
      } else {
        throw new Error("Checkbox not found");
      }
    });

    it("should delete a task", async () => {
      const user = userEvent.setup();
      mockService.getTaskLists.mockResolvedValue(mockTaskLists);
      mockService.deleteTask.mockResolvedValue();

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Task 1")).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText("Delete task Task 1");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockService.deleteTask).toHaveBeenCalledWith("1", "101");
      });
    });
  });
});
