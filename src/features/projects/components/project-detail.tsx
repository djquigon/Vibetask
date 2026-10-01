'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { Project } from '../types';
import type { Task } from '@/features/tasks/types';
import { projectProgress } from '../progress';
import { changeProjectStatus } from '../server/actions';
import { ProjectForm } from './project-form';
import { TasksView } from '@/features/tasks/components/tasks-view';
import { ProjectTaskLinker } from './project-task-linker';

export function ProjectDetail({ project, projects, tasks }: { project: Project; projects: Project[]; tasks: Task[] }) {
    const progress = projectProgress(project.id, tasks);
    const [pending, start] = useTransition();
    const [message, setMessage] = useState('');
    return <div className="space-y-5">
        <Link href="/dashboard/projects" className="text-sm text-vt-green">← All projects</Link>
        <header className="rounded border border-vt-border bg-vt-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="break-words font-mono text-2xl font-black text-vt-primary">{project.name}</h1>
                <button type="button" disabled={pending} className="rounded border border-vt-border px-3 py-2 text-sm text-vt-primary" onClick={() => start(async () => {
                    const result = await changeProjectStatus(project.id, project.status === 'active' ? 'archived' : 'active');
                    setMessage(result.message);
                })}>{pending ? 'Saving…' : project.status === 'active' ? 'Archive project' : 'Restore project'}</button>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm text-vt-text-muted">{project.description}</p>
            <p className="mt-3 font-mono text-sm text-vt-primary">{progress.completed} / {progress.total} tasks complete · {progress.percent}%</p>
            <progress value={progress.completed} max={Math.max(progress.total, 1)} aria-label="Project progress" className="mt-2 h-2 w-full accent-vt-green" />
            {project.status === 'archived' ? <p className="mt-3 text-sm text-vt-text-muted">Archived projects are hidden from the dashboard and calendar. Their tasks stay available.</p> : null}
            {message ? <p role="status" className="mt-3 text-sm">{message}</p> : null}
        </header>
        <details className="rounded border border-vt-border bg-vt-surface p-4">
            <summary className="cursor-pointer font-mono font-bold text-vt-primary">Edit project and dates</summary>
            <div className="mt-4"><ProjectForm draft={project} id={project.id} editing /></div>
        </details>
        <ProjectTaskLinker projectId={project.id} projects={projects} tasks={tasks} />
        <TasksView tasks={tasks.filter((task) => task.projectId === project.id)} projects={projects} initialProjectId={project.id} embedded />
    </div>;
}
