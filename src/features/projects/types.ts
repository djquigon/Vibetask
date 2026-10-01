export type ProjectStatus = 'active' | 'archived';
export type ProjectDraft = {
    name: string;
    description: string;
    startDate: string | null;
    dueDate: string | null;
};
export type Project = ProjectDraft & {
    id: string;
    userId: string;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
};
export type ProjectOption = Pick<Project, 'id' | 'name' | 'status'>;
export type ProjectActionState = { status: 'idle' | 'success' | 'error'; message: string };
