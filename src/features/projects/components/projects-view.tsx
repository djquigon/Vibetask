'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Project } from '../types';
import type { Task } from '@/features/tasks/types';
import { projectProgress } from '../progress';
import { ProjectForm } from './project-form';

export function ProjectsView({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
    const [showArchived, setShowArchived] = useState(false);
    const visible = projects.filter((project) => showArchived ? project.status === 'archived' : project.status === 'active');
    return <div className="space-y-5">
        <h1 className="font-mono text-2xl font-black uppercase text-vt-primary">Projects</h1>
        <details className="rounded border border-vt-border bg-vt-surface p-4">
            <summary className="cursor-pointer font-mono font-bold text-vt-primary">Create project</summary>
            <div className="mt-4"><ProjectForm /></div>
        </details>
        <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-sm"><input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} className="mr-2" />Show archived projects</label>
            <Link href="/dashboard/calendar" className="text-sm text-vt-green">View calendar</Link>
        </div>
        {visible.length === 0 ? <p className="text-vt-text-muted">{showArchived ? 'No archived projects.' : 'Create a project to organize your tasks and plan your timeline.'}</p> : (
            <div className="grid gap-4 xl:grid-cols-2">
                {visible.map((project) => {
                    const progress = projectProgress(project.id, tasks);
                    return <Link key={project.id} href={'/dashboard/projects/' + project.id} className="block rounded border border-vt-border bg-vt-surface p-4 transition hover:border-vt-green">
                        <h2 className="break-words font-mono text-lg font-bold text-vt-primary">{project.name}</h2>
                        {project.description ? <p className="mt-2 line-clamp-3 break-words text-sm text-vt-text-muted">{project.description}</p> : null}
                        <p className="mt-3 text-sm">{progress.completed} of {progress.total} tasks complete · {progress.percent}%</p>
                        <progress value={progress.completed} max={Math.max(progress.total, 1)} aria-label={project.name + ' progress'} className="mt-2 h-2 w-full accent-vt-green" />
                        <p className="mt-3 font-mono text-xs text-vt-primary">{project.startDate ?? 'No start date'} → {project.dueDate ?? 'No due date'}</p>
                    </Link>;
                })}
            </div>
        )}
    </div>;
}
