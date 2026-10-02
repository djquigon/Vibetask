export type TaskStatus = 'todo' | 'in_progress' | 'ready_for_review' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

export type TaskDraft = {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string | null;
    projectId: string | null;
    estimatedMinutes?: number | null;
};
export type Task = TaskDraft & {
    id: string;
    status: TaskStatus;
    userId: string;
    createdAt: string;
    updatedAt: string;
    parentId: string | null;
    archivedAt: string | null;
};
export type TaskActionState = { status: 'idle' | 'success' | 'error'; message: string };
