export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

export type TaskDraft = {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string | null;
    projectId: string | null;
};
export type Task = TaskDraft & {
    id: string;
    status: TaskStatus;
    userId: string;
    createdAt: string;
    updatedAt: string;
};
export type TaskActionState = { status: 'idle' | 'success' | 'error'; message: string };
