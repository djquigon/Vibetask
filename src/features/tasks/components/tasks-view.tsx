'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { ProjectOption } from '@/features/projects/types';
import type { Task, TaskStatus } from '../types';
import { archiveTask, changeTaskStatus, deleteTask } from '../server/actions';
import { TaskForm } from './task-form';
import { SplitTaskForm } from '@/features/planning/components/split-task-form';
import { taskEstimate } from '@/features/planning/logic';
import type { FocusLoadResult } from '@/features/focus/types';
import { actualSeconds, formatTime } from '@/features/focus/time';
import { FocusLoadNotice } from '@/features/focus/components/focus-load-notice';

export function TasksView({ tasks, projects = [], initialProjectId = null, embedded = false, focus }: { tasks: Task[]; projects?: ProjectOption[]; initialProjectId?: string | null; embedded?: boolean; focus?: FocusLoadResult }) {
    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
    const [projectFilter, setProjectFilter] = useState(initialProjectId ?? 'all');
    const [showArchived, setShowArchived] = useState(false);
    const filtered = tasks.filter((task) => (filter === 'all' || task.status === filter)
        && (showArchived || !task.archivedAt)
        && (projectFilter === 'all' || (projectFilter === 'none' ? !task.projectId : task.projectId === projectFilter)));
    return (
        <div className="space-y-5">
            {embedded ? <h2 className="font-mono text-xl font-black uppercase text-vt-primary">Project tasks</h2> : <h1 className="font-mono text-2xl font-black uppercase text-vt-primary">Tasks</h1>}
            {focus?.status === 'unavailable' ? <FocusLoadNotice setupRequired={focus.setupRequired} /> : null}
            <section className="rounded border border-vt-border bg-vt-surface p-4">
                <h2 className="mb-3 font-mono text-lg text-vt-primary">Quick capture</h2>
                <TaskForm key={projectFilter} projects={projects} defaultProjectId={projectFilter === 'all' || projectFilter === 'none' ? null : projectFilter} />
            </section>
            <label className="block text-sm">Show
                <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="ml-3 rounded border border-vt-border bg-vt-background p-2">
                    <option value="all">All tasks</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="ready_for_review">Ready for review</option><option value="done">Done</option>
                </select>
            </label>
            <label className="block text-sm"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="mr-2" />Show archived tasks</label>
            {!embedded ? <label className="block text-sm">Project
                <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="ml-3 rounded border border-vt-border bg-vt-background p-2">
                    <option value="all">All projects</option><option value="none">No project</option>
                    {projects.map((project) => <option key={project.id} value={project.id}>{project.name}{project.status === 'archived' ? ' (archived)' : ''}</option>)}
                </select>
            </label> : null}
            <div className="space-y-3">
                {filtered.length === 0 ? <p className="text-vt-text-muted">No tasks here yet. Capture one above or ask the assistant to draft one.</p> : filtered.map((task) => <TaskRow key={task.id} task={task} projects={projects} tasks={tasks} actual={focus?.status === 'ready' ? actualSeconds(focus.sessions, [task.id]) : undefined} />)}
            </div>
        </div>
    );
}

function TaskRow({ task, projects, tasks, actual }: { task: Task; projects: ProjectOption[]; tasks: Task[]; actual?: number }) {
    const [pending, start] = useTransition();
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [splitting, setSplitting] = useState(false);
    const children = tasks.filter((value) => value.parentId === task.id);
    const estimate = taskEstimate(task, tasks);
    function status(value: string) {
        start(async () => { const result = await changeTaskStatus(task.id, value); setError(result.status === 'error' ? result.message : ''); });
    }
    return (
        <article id={'task-' + task.id} className="scroll-mt-4 rounded border border-vt-border bg-vt-surface p-4">
            <div className="flex flex-wrap items-center gap-3">
                <input type="checkbox" checked={task.status === 'done'} disabled={pending} onChange={() => status(task.status === 'done' ? 'todo' : 'done')} aria-label={task.status === 'done' ? 'Reopen ' + task.title : 'Complete ' + task.title} />
                <h2 className={'min-w-0 flex-1 break-words font-bold ' + (task.status === 'done' ? 'line-through text-vt-text-muted' : 'text-vt-text')}>{task.title}</h2>
                <span className="text-xs uppercase text-vt-primary">{task.priority}</span>
                <select aria-label={'Status for ' + task.title} value={task.status} disabled={pending} onChange={(event) => status(event.target.value)} className="rounded border border-vt-border bg-vt-background p-2 text-sm">
                    <option value="todo">To do</option><option value="in_progress">In progress</option><option value="ready_for_review" disabled>Ready for review</option><option value="done">Done</option>
                </select>
                <button type="button" disabled={pending} onClick={() => setEditing(!editing)} className="text-sm text-vt-primary">{editing ? 'Cancel edit' : 'Edit'}</button>
                <button type="button" disabled={pending} onClick={() => start(async () => { const result = await archiveTask(task.id, !task.archivedAt); setError(result.status === 'error' ? result.message : ''); })} className="text-sm text-vt-primary">{task.archivedAt ? 'Restore' : 'Archive'}</button>
                <button type="button" disabled={pending} onClick={() => setConfirmDelete(true)} className="text-xs text-vt-red">Permanently delete</button>
            </div>
            {task.description ? <p className="mt-2 whitespace-pre-wrap break-words text-sm text-vt-text-muted">{task.description}</p> : null}
            <p className="mt-2 text-xs text-vt-primary">{estimate.minutes} min estimated{estimate.unknown ? ' · ' + estimate.unknown + ' unestimated' : ''}{task.archivedAt ? ' · Archived' : ''}</p>
            {task.parentId ? <Link href={'#task-' + task.parentId} className="mt-2 block text-xs text-vt-green">Subtask of {tasks.find((value) => value.id === task.parentId)?.title ?? 'parent task'}</Link> : null}
            {children.length ? <p className="mt-2 text-xs">{children.filter((value) => value.status === 'done').length}/{children.length} subtasks complete · parent requires final review</p> : null}
            {task.status === 'ready_for_review' ? <p className="mt-2 text-sm text-vt-green">Ready for review — confirm completion using the checkbox above.</p> : null}
            {!task.parentId && !task.archivedAt ? <button type="button" className="mt-2 text-sm text-vt-green" onClick={() => setSplitting(!splitting)}>{splitting ? 'Cancel subtasks' : children.length ? 'Add subtasks' : 'Split into subtasks'}</button> : null}
            {splitting ? <SplitTaskForm parentId={task.id} onSaved={() => setSplitting(false)} /> : null}
            {task.dueDate ? <p className="mt-2 font-mono text-xs text-vt-primary">Due {task.dueDate}</p> : null}
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {actual !== undefined ? <span className="font-mono text-vt-primary">Actual work {formatTime(actual)} (minutes:seconds)</span> : null}
                <Link href={'/dashboard/focus?task=' + task.id} className="text-vt-green">Start focus</Link>
            </div>
            {task.projectId ? <Link href={'/dashboard/projects/' + task.projectId} className="mt-2 block text-xs text-vt-green">Project: {projects.find((project) => project.id === task.projectId)?.name ?? 'View project'}</Link> : null}
            {editing ? <div className="mt-4"><TaskForm id={task.id} draft={task} projects={projects} editing estimateDerived={children.length > 0} inheritedProject={Boolean(task.parentId)} onSaved={() => setEditing(false)} /></div> : null}
            {confirmDelete ? <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <p>Delete this task permanently?</p>
                <button type="button" disabled={pending} className="text-vt-red" onClick={() => start(async () => { const result = await deleteTask(task.id); setError(result.status === 'error' ? result.message : ''); setConfirmDelete(false); })}>Confirm delete</button>
                <button type="button" onClick={() => setConfirmDelete(false)}>Keep task</button>
            </div> : null}
            {error ? <p role="alert" className="mt-2 text-sm text-vt-red">{error}</p> : null}
        </article>
    );
}
