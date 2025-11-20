# Phase 1 Update: List View & Subtasks

## Overview
This update introduces two major enhancements to the Task Management module: a new **List View** for tasks and support for **Subtasks**. These features aim to provide users with more flexible ways to view their work and break down complex tasks.

## New Features

### 1. List View
-   **Switch Views**: Users can now toggle between the classic **Kanban Board** view and the new **List View** using the buttons in the board header.
-   **Table Layout**: The List View displays tasks in a structured table format, grouped by their respective columns (e.g., "To Do", "In Progress").
-   **Columns Displayed**:
    -   **Task Name**: The title of the task.
    -   **Priority**: Color-coded priority badge (High, Medium, Low).
    -   **Due Date**: The scheduled due date for the task.
    -   **Subtasks**: A progress indicator showing completed/total subtasks (e.g., "1/3").

### 2. Subtasks
-   **Break Down Tasks**: Users can now add multiple subtasks to a main task.
-   **Management**:
    -   **Add**: Easily add new subtasks via the Task Details Modal.
    -   **Toggle**: Mark subtasks as completed or incomplete directly from the modal.
    -   **Delete**: Remove subtasks that are no longer needed.
-   **Visual Progress**:
    -   **Kanban Card**: The card on the board now shows a small badge with the subtask count and completion status.
    -   **List View**: The "Subtasks" column displays the progress fraction.

### 3. Technical Improvements
-   **Data Model**: The `Task` interface was updated to include a `subtasks` array.
-   **Sorting**: Fixed an issue with Firestore indexing by implementing client-side sorting for Boards and Columns.
-   **Test Coverage**: Added unit tests for the new List View switching and subtask data structure.

## How to Use

1.  **Accessing List View**:
    -   Open a Board.
    -   Click the "List" icon (bars) in the top-right header next to the "Board" icon (grid).
    -   The view will switch to a table layout.

2.  **Managing Subtasks**:
    -   Click on any task to open the **Task Details Modal**.
    -   Scroll down to the "Subtasks" section.
    -   Type a subtask description in the input field and click "Add".
    -   Click the checkbox next to a subtask to mark it as done.
    -   Click the trash icon to delete a subtask.

## Code Changes
-   **`src/modules/task-lists/types/task-list.ts`**: Added `Subtask` interface.
-   **`src/modules/task-lists/components/task-lists.tsx`**: Added view switcher logic and `ListView` integration.
-   **`src/modules/task-lists/components/list-view.tsx`**: Created the new table component.
-   **`src/modules/task-lists/components/task-details-modal.tsx`**: Added subtask UI and logic.
-   **`src/modules/task-lists/components/kanban-card.tsx`**: Added subtask progress badge.
