import { taskId } from '@/features/tasks/validation';
import type { PlanInput, SplitChild } from './types';
export function planningDate(value: unknown): string {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error('Choose a valid plan date.');
    return value;
}
export function planningTimezone(value: unknown): string {
    if (typeof value !== 'string' || value.length > 100) throw new Error('Choose a valid timezone.');
    try { new Intl.DateTimeFormat('en', { timeZone: value }).format(); } catch { throw new Error('Choose a valid timezone.'); }
    return value;
}
export function parsePlanInput(value: unknown): PlanInput {
    if (!value || typeof value !== 'object') throw new Error('Invalid plan.');
    const data = value as PlanInput;
    const date = planningDate(data.date), timezone = planningTimezone(data.timezone);
    if (data.budgetMinutes !== null && (!Number.isInteger(data.budgetMinutes) || data.budgetMinutes < 0 || data.budgetMinutes > 1440)) throw new Error('Budget must be 0 to 1440 minutes.');
    if (!Number.isInteger(data.revision) || data.revision < 0) throw new Error('Refresh the plan before saving.');
    if (!Array.isArray(data.items) || data.items.length > 100) throw new Error('Choose at most 100 tasks.');
    const ids = new Set<string>();
    const items = data.items.map((item) => {
        const id = taskId(item.taskId);
        if (ids.has(id)) throw new Error('A task can only appear once in a daily plan.');
        ids.add(id);
        if ((item.start === null) !== (item.end === null)) throw new Error('Choose both a start and end time.');
        if (item.start !== null && (typeof item.start !== 'string' || typeof item.end !== 'string' || !Number.isFinite(Date.parse(item.start)) || !Number.isFinite(Date.parse(item.end)) || Date.parse(item.end) <= Date.parse(item.start))) throw new Error('Choose a valid work block.');
        return { taskId: id, start: item.start, end: item.end };
    });
    return { date, timezone, budgetMinutes: data.budgetMinutes, revision: data.revision, items };
}
export function parseSplitChildren(value: unknown): SplitChild[] {
    if (!Array.isArray(value) || value.length < 1 || value.length > 20) throw new Error('Create 1 to 20 subtasks.');
    const ids = new Set<string>();
    return value.map((item) => {
        const id = taskId(item.id);
        if (ids.has(id)) throw new Error('Duplicate subtask ID.');
        ids.add(id);
        if (typeof item.title !== 'string' || !item.title.trim() || item.title.trim().length > 200 || typeof item.description !== 'string' || item.description.length > 2000) throw new Error('Give each subtask a title and valid details.');
        if (!Number.isInteger(item.estimatedMinutes) || item.estimatedMinutes < 1 || item.estimatedMinutes > 10080) throw new Error('Subtask estimates must be 1 to 10080 minutes.');
        return { id, title: item.title.trim(), description: item.description.trim(), estimatedMinutes: item.estimatedMinutes };
    });
}
