import type { Task } from '@/features/tasks/types';
import type { Project } from '@/features/projects/types';

export type ConnectedCalendarEvent = {
    id: string; title: string; start: string; end?: string; allDay: true;
    url: string; color: string; extendedProps: { kind: 'project' | 'task'; projectId: string | null };
};

function nextDay(date: string) {
    const value = new Date(date + 'T00:00:00Z');
    value.setUTCDate(value.getUTCDate() + 1);
    return value.toISOString().slice(0, 10);
}

export function connectedCalendarEvents(projects: readonly Project[], tasks: readonly Task[], includeCompleted = false): ConnectedCalendarEvent[] {
    const names = new Map(projects.map((project) => [project.id, project.name]));
    const events: ConnectedCalendarEvent[] = [];
    for (const project of projects) {
        const start = project.startDate ?? project.dueDate;
        if (project.status === 'archived' || !start) continue;
        events.push({
            id: 'project-' + project.id, title: 'Project · ' + project.name,
            start, ...(project.dueDate ? { end: nextDay(project.dueDate) } : {}),
            allDay: true, url: '/dashboard/projects/' + project.id, color: '#c8792d',
            extendedProps: { kind: 'project', projectId: project.id },
        });
    }
    for (const task of tasks) {
        if (!task.dueDate || (!includeCompleted && task.status === 'done')) continue;
        const projectName = task.projectId ? names.get(task.projectId) : null;
        events.push({
            id: 'task-' + task.id,
            title: (task.status === 'done' ? 'Done · ' : 'Task · ') + task.title + (projectName ? ' · ' + projectName : ''),
            start: task.dueDate, allDay: true, url: '/dashboard/tasks#task-' + task.id,
            color: task.status === 'done' ? '#647868' : '#438454',
            extendedProps: { kind: 'task', projectId: task.projectId },
        });
    }
    return events;
}
