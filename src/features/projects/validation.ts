import type { ProjectDraft } from './types';

export function projectId(value: unknown): string {
    if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        throw new Error('Choose a valid project.');
    }
    return value;
}

function date(value: unknown): string | null {
    if (value === null || value === '') return null;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)
        || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
        throw new Error('Choose valid project dates.');
    }
    return value;
}

export function parseProjectDraft(value: unknown): ProjectDraft {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid project draft.');
    const item = value as Record<string, unknown>;
    if (typeof item.name !== 'string' || !item.name.trim() || item.name.trim().length > 120) {
        throw new Error('Project name must contain 1 to 120 characters.');
    }
    if (typeof item.description !== 'string' || item.description.length > 2000) {
        throw new Error('Project description must be 2000 characters or fewer.');
    }
    const startDate = date(item.startDate);
    const dueDate = date(item.dueDate);
    if (startDate && dueDate && startDate > dueDate) throw new Error('Project due date must be on or after its start date.');
    return { name: item.name.trim(), description: item.description.trim(), startDate, dueDate };
}
