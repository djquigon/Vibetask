import type { TaskDraft, TaskPriority, TaskStatus } from './types';

export function taskId(value: unknown): string {
    if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        throw new Error('Invalid task ID.');
    }
    return value;
}

export function taskStatus(value: unknown): TaskStatus {
    if (value !== 'todo' && value !== 'in_progress' && value !== 'ready_for_review' && value !== 'done') throw new Error('Invalid task status.');
    return value;
}

export function parseTaskDraft(value: unknown): TaskDraft {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid task draft.');
    const item = value as Record<string, unknown>;
    if (typeof item.title !== 'string' || !item.title.trim() || item.title.trim().length > 200) {
        throw new Error('Task title must contain 1 to 200 characters.');
    }
    if (typeof item.description !== 'string' || item.description.length > 2000) {
        throw new Error('Task description must be 2000 characters or fewer.');
    }
    if (!['low', 'normal', 'high'].includes(item.priority as string)) throw new Error('Invalid task priority.');
    const dueDate = item.dueDate === '' ? null : item.dueDate;
    if (dueDate !== null && (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)
        || !Number.isFinite(Date.parse(dueDate)) || new Date(dueDate).toISOString().slice(0, 10) !== dueDate)) {
        throw new Error('Choose a valid due date.');
    }
    const projectId = item.projectId === '' || item.projectId === undefined ? null : item.projectId;
    if (projectId !== null && (typeof projectId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId))) {
        throw new Error('Choose a valid project.');
    }
    const estimatedMinutes = item.estimatedMinutes == null || item.estimatedMinutes === '' ? null : Number(item.estimatedMinutes);
    if (estimatedMinutes !== null && (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 1 || estimatedMinutes > 10080)) throw new Error('Estimate must be 1 to 10080 minutes.');
    return { title: item.title.trim(), description: item.description.trim(), priority: item.priority as TaskPriority, dueDate: dueDate as string | null, projectId: projectId as string | null, estimatedMinutes };
}
