'use client';
import Link from 'next/link';
import type { Task } from '@/features/tasks/types';
import type { FocusSession } from '../types';
import { actualSeconds, formatTime } from '../time';
import { FocusConsole } from './focus-console';

export function FocusView({ sessions, tasks, initialTaskId }: { sessions: FocusSession[]; tasks: Task[]; initialTaskId?: string }) {
    return <div className="space-y-4">
        <h1 className="font-mono text-2xl font-black uppercase text-vt-primary">Focus & actual time</h1>
        <FocusConsole sessions={sessions} tasks={tasks} initialTaskId={initialTaskId} />
        <section className="rounded border border-vt-border bg-vt-surface p-4">
            <h2 className="font-mono text-lg font-bold text-vt-primary">Recorded work</h2>
            <p className="mt-2 font-mono text-3xl text-vt-green">{formatTime(actualSeconds(sessions))} <span className="text-sm">minutes:seconds total</span></p>
            <p className="mt-2 text-sm text-vt-text-muted">{sessions.filter((session) => session.kind === 'work' && session.status === 'completed').length} completed work sessions. Task time rolls up through its current project.</p>
        </section>
        <section className="rounded border border-vt-border bg-vt-surface p-4">
            <h2 className="font-mono text-lg font-bold text-vt-primary">Session history</h2>
            {sessions.length === 0 ? <p className="mt-3 text-sm text-vt-text-muted">Start your first session from a task or the daily dashboard.</p> : <ul className="mt-3 divide-y divide-vt-border">
                {sessions.map((session) => <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div><p className="break-words font-bold">{session.taskId ? <Link className="text-vt-green" href={'/dashboard/tasks#task-' + session.taskId}>{tasks.find((task) => task.id === session.taskId)?.title ?? session.label}</Link> : session.label}</p><p className="font-mono text-xs text-vt-text-muted">{session.startedAt.slice(0, 16).replace('T', ' ')} UTC · {session.kind} · {session.status}</p></div>
                    <span className="font-mono text-vt-primary">{formatTime(session.elapsedSeconds)} recorded / {formatTime(session.plannedSeconds)} target</span>
                </li>)}
            </ul>}
        </section>
    </div>;
}
