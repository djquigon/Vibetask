import type { Task } from '@/features/tasks/types';

export function projectProgress(projectId: string, tasks: readonly Task[]) {
    const linked = tasks.filter((task) => task.projectId === projectId && !task.parentId);
    const completed = linked.filter((task) => task.status === 'done').length;
    return { total: linked.length, completed, percent: linked.length ? Math.round(completed / linked.length * 100) : 0 };
}
