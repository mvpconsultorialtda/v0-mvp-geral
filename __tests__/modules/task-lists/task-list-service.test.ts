import { TaskListService } from "@/modules/task-lists/services/task-list-service";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
} from "firebase/firestore";

// Mock firebase/firestore
jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    orderBy: jest.fn(),
    writeBatch: jest.fn(() => ({
        update: jest.fn(),
        commit: jest.fn(),
    })),
    runTransaction: jest.fn(),
    serverTimestamp: jest.fn(),
}));

// Mock firebase client
jest.mock("@/lib/firebase-client", () => ({
    db: {},
}));

describe("TaskListService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getBoards", () => {
        it("fetches boards and sorts them by createdAt in ascending order", async () => {
            const mockBoards = [
                { id: "b1", workspaceId: "w1", name: "Board B", createdAt: "2023-01-02" },
                { id: "b2", workspaceId: "w1", name: "Board A", createdAt: "2023-01-01" },
                { id: "b3", workspaceId: "w1", name: "Board C", createdAt: "2023-01-03" },
            ];

            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockBoards.map((b) => ({
                    id: b.id,
                    data: () => b,
                })),
            });

            const result = await TaskListService.getBoards("w1");

            // Verify query was called WITHOUT orderBy
            expect(query).toHaveBeenCalled();
            expect(orderBy).not.toHaveBeenCalled(); // Should not be called for getBoards anymore

            // Verify sorting
            expect(result[0].id).toBe("b2"); // 2023-01-01
            expect(result[1].id).toBe("b1"); // 2023-01-02
            expect(result[2].id).toBe("b3"); // 2023-01-03
        });
    });

    describe("getColumns", () => {
        it("fetches columns and sorts them by order in ascending order", async () => {
            const mockColumns = [
                { id: "c1", boardId: "b1", title: "Col 2", order: 1 },
                { id: "c2", boardId: "b1", title: "Col 1", order: 0 },
                { id: "c3", boardId: "b1", title: "Col 3", order: 2 },
            ];

            (getDocs as jest.Mock).mockResolvedValue({
                docs: mockColumns.map((c) => ({
                    id: c.id,
                    data: () => c,
                })),
            });

            const result = await TaskListService.getColumns("b1");

            // Verify query was called WITHOUT orderBy
            expect(query).toHaveBeenCalled();
            expect(orderBy).not.toHaveBeenCalled();

            // Verify sorting
            expect(result[0].id).toBe("c2"); // order 0
            expect(result[1].id).toBe("c1"); // order 1
            expect(result[2].id).toBe("c3"); // order 2
        });
    });
});
