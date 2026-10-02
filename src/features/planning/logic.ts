import type { Task } from '@/features/tasks/types';
import type { Project } from '@/features/projects/types';
import type { PlanItem } from './types';

export function dateInZone(timezone: string, now = new Date()) {
    const parts = new Intl.DateTimeFormat('en', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const part = (name: string) => parts.find((value) => value.type === name)?.value;
    return part('year') + '-' + part('month') + '-' + part('day');
}
export function taskEstimate(task: Task, tasks: readonly Task[]) {
    const children = tasks.filter((value) => value.parentId === task.id);
    const values = children.length ? children : [task];
    return { minutes: values.reduce((sum, value) => sum + (value.estimatedMinutes ?? 0), 0), unknown: values.filter((value) => value.estimatedMinutes == null).length };
}
export function planningCandidates(tasks: readonly Task[], projects: readonly Project[]) {
    const parents = new Set(tasks.map((task) => task.parentId).filter(Boolean));
    return tasks.filter((task) => !parents.has(task.id) && !task.archivedAt && task.status !== 'done'
        && (!task.projectId || !projects.some((project) => project.id === task.projectId && project.status === 'archived')))
        .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999')
            || ({ high: 0, normal: 1, low: 2 }[a.priority] - { high: 0, normal: 1, low: 2 }[b.priority])
            || (a.estimatedMinutes ?? Infinity) - (b.estimatedMinutes ?? Infinity) || a.createdAt.localeCompare(b.createdAt));
}
export function planTotals(items: readonly PlanItem[]) {
    return {
        estimated: items.reduce((sum, item) => sum + item.estimate.minutes, 0),
        unknown: items.reduce((sum, item) => sum + item.estimate.unknown, 0),
        scheduled: items.reduce((sum, item) => sum + (item.start && item.end ? (Date.parse(item.end) - Date.parse(item.start)) / 60000 : 0), 0),
    };
}
export function overlaps(items: readonly Pick<PlanItem, 'taskId' | 'start' | 'end' | 'title'>[]) {
    const pairs: string[] = [];
    items.forEach((a, i) => items.slice(i + 1).forEach((b) => {
        if (a.start && a.end && b.start && b.end && Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end)) pairs.push(a.title + ' overlaps ' + b.title);
    }));
    return pairs;
}
export function suggestedTasks(tasks: Task[], projects: Project[], budget: number, selected: string[] = []) {
    let remaining = budget;
    const results: Task[] = [];
    for (const task of planningCandidates(tasks, projects)) {
        if (selected.includes(task.id)) continue;
        if (task.estimatedMinutes == null || task.estimatedMinutes <= remaining) {
            results.push(task);
            remaining -= task.estimatedMinutes ?? 0;
        }
    }
    return results;
}
