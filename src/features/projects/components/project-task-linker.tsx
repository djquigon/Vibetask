'use client';
import { useActionState } from 'react';
import type { ProjectOption } from '../types';
import type { Task, TaskActionState } from '@/features/tasks/types';
import { linkTaskToProject } from '@/features/tasks/server/actions';

const initial: TaskActionState = { status: 'idle', message: '' };

export function ProjectTaskLinker({ projectId, tasks, projects }: { projectId: string; tasks: Task[]; projects: ProjectOption[] }) {
    const available = tasks.filter((task) => task.projectId !== projectId);
    const [state, action, pending] = useActionState(async (_previous: TaskActionState, data: FormData) =>
        linkTaskToProject(String(data.get('taskId')), projectId), initial);
    if (!available.length) return null;

    return <details className="rounded border border-vt-border bg-vt-surface p-4">
        <summary className="cursor-pointer font-mono font-bold text-vt-primary">Link an existing task</summary>
        <p className="mt-3 text-sm text-vt-text-muted">Each task belongs to one project. Linking a task moves it from its current project.</p>
        <form action={action} className="mt-3 space-y-3">
            <label className="block text-sm text-vt-primary">Task
                <select name="taskId" required disabled={pending} defaultValue="" className="mt-1 w-full rounded border border-vt-border bg-vt-background p-2 text-vt-text">
                    <option value="" disabled>Choose an existing task</option>
                    {available.map((task) => <option key={task.id} value={task.id}>{task.title} · {projects.find((project) => project.id === task.projectId)?.name ?? 'No project'}</option>)}
                </select>
            </label>
            <button type="submit" disabled={pending} className="rounded bg-vt-primary px-4 py-2 font-bold text-vt-ink disabled:opacity-60">{pending ? 'Linking…' : 'Link to this project'}</button>
            {state.message ? <p role="status" className={state.status === 'error' ? 'text-vt-red' : 'text-vt-green'}>{state.message}</p> : null}
        </form>
    </details>;
}
