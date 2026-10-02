'use client';
import Link from 'next/link';
import { useCurrentUser } from '@/features/profile/hooks/use-current-user';
import type { Task } from '@/features/tasks/types';
import { TaskForm } from '@/features/tasks/components/task-form';
import type { Project } from '@/features/projects/types';
import { projectProgress } from '@/features/projects/progress';

export function DashboardOverview({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
    const currentUser = useCurrentUser();
    const topLevel = tasks.filter((task) => !task.parentId && !task.archivedAt);
    const done = topLevel.filter((task) => task.status === 'done').length;
    const active = topLevel.filter((task) => task.status !== 'done').sort((a, b) =>
        (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') ||
        ({ high: 0, normal: 1, low: 2 }[a.priority] - { high: 0, normal: 1, low: 2 }[b.priority]));
    return (
        <div className="space-y-4">
            <section className="rounded border border-vt-border-strong bg-vt-display p-4 text-vt-ink">
                <h1 className="break-words font-mono text-3xl font-black uppercase">Welcome, {currentUser?.displayName || 'Vibetask user'}</h1>
                <p className="mt-2 font-mono text-sm">Your tasks, your next steps.</p>
            </section>
            <section className="grid gap-3 sm:grid-cols-3">
                {[['Open tasks', active.length], ['Completed', done], ['Completion', topLevel.length ? Math.round(done / topLevel.length * 100) + '%' : '0%']].map(([title, value]) => (
                    <div key={title} className="rounded border border-vt-border bg-vt-surface p-4">
                        <p className="font-mono text-sm uppercase text-vt-primary">{title}</p>
                        <p className="mt-3 font-mono text-4xl font-black text-vt-primary">{value}</p>
                    </div>
                ))}
            </section>
            <section className="rounded border border-vt-border bg-vt-surface p-4">
                <h2 className="mb-3 font-mono text-lg font-bold uppercase text-vt-primary">Quick capture</h2>
                <TaskForm projects={projects} />
            </section>
            <section className="rounded border border-vt-border bg-vt-surface p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="font-mono text-lg font-bold uppercase text-vt-primary">Active projects</h2>
                    <Link href="/dashboard/projects" className="text-sm text-vt-green">View all projects</Link>
                </div>
                {projects.filter((project) => project.status === 'active').length === 0 ? <p className="text-sm text-vt-text-muted">Create a project to connect your tasks and calendar.</p> : <ul className="divide-y divide-vt-border">
                    {projects.filter((project) => project.status === 'active').slice(0, 4).map((project) => {
                        const progress = projectProgress(project.id, tasks);
                        return <li key={project.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                            <Link href={'/dashboard/projects/' + project.id} className="break-words font-bold">{project.name}</Link>
                            <span className="font-mono text-vt-primary">{progress.completed}/{progress.total} complete · {progress.percent}%</span>
                        </li>;
                    })}
                </ul>}
            </section>
            <section className="rounded border border-vt-border bg-vt-surface p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="font-mono text-lg font-bold uppercase text-vt-primary">Next tasks</h2>
                    <Link href="/dashboard/tasks" className="text-sm text-vt-green">View all tasks</Link>
                </div>
                {active.length === 0 ? <p className="text-sm text-vt-text-muted">No open tasks. Add a task above to start your plan.</p> : (
                    <ul className="divide-y divide-vt-border">
                        {active.slice(0, 6).map((task) => <li key={task.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                            <Link href="/dashboard/tasks" className="break-words font-bold">{task.title}</Link>
                            <span className="font-mono text-vt-primary">{task.priority} · {task.dueDate ?? 'No due date'}</span>
                        </li>)}
                    </ul>
                )}
            </section>
        </div>
    );
}
