export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
}

export interface Board {
    id: string;
    workspaceId: string;
    name: string;
    createdAt: string;
}
