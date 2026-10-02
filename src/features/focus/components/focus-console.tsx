'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Task } from '@/features/tasks/types';
import type { FocusAction, FocusSession } from '../types';
import { elapsedSeconds, formatTime } from '../time';
import { startFocus, transitionFocus } from '../server/actions';

const control = 'rounded border border-vt-border bg-vt-background px-3 py-2 text-sm disabled:opacity-50';

export function FocusConsole({ sessions, tasks, initialTaskId = '' }: { sessions: FocusSession[]; tasks: Task[]; initialTaskId?: string }) {
    const router = useRouter();
    const active = sessions.find((session) => session.status === 'running' || session.status === 'paused');
    const [taskId, setTaskId] = useState(tasks.some((task) => task.id === initialTaskId) ? initialTaskId : '');
    const [kind, setKind] = useState<'work' | 'break'>('work');
    const [minutes, setMinutes] = useState(25);
    const [label, setLabel] = useState('Deep work');
    const [pending, start] = useTransition();
    const [message, setMessage] = useState('');
    const [discard, setDiscard] = useState<string | null>(null);
    const [now, setNow] = useState<number | null>(null);
    const retryId = useRef<string | null>(null);

    useEffect(() => {
        const tick = window.setInterval(() => setNow(Date.now()), 1000);
        const sync = window.setInterval(() => router.refresh(), 15000);
        const onFocus = () => router.refresh();
        window.addEventListener('focus', onFocus);
        return () => { window.clearInterval(tick); window.clearInterval(sync); window.removeEventListener('focus', onFocus); };
    }, [router]);

    function transition(action: FocusAction) {
        if (!active) return;
        start(async () => {
            try {
                const result = await transitionFocus(active.id, action, active.version);
                setMessage(result.status === 'error' ? result.message : action === 'finish' ? 'Session saved. Actual time updated.' : 'Session updated.');
                setDiscard(null);
            } catch { setMessage('Connection interrupted. Refresh and retry; saved time will not be duplicated.'); }
            router.refresh();
        });
    }

    const elapsed = active ? elapsedSeconds(active, now ?? Date.parse(active.runningSince ?? active.startedAt)) : 0;
    const remaining = active ? active.plannedSeconds - elapsed : 0;
    return <section className="rounded border border-vt-border-strong bg-vt-surface p-4">
        <h2 className="font-mono text-lg font-black uppercase text-vt-primary">{active ? 'Current session' : 'Start focus'}</h2>
        {active ? <div className="mt-4 space-y-3">
            <p className="break-words font-bold">{tasks.find((task) => task.id === active.taskId)?.title ?? active.label} <span className="text-xs uppercase text-vt-green">{active.kind} · {active.status}</span></p>
            {active.taskId ? <Link href={'/dashboard/tasks#task-' + active.taskId} className="text-sm text-vt-green">Open source task</Link> : null}
            <p role="timer" aria-label="Time remaining" className="font-mono text-6xl font-black tabular-nums text-vt-primary">{formatTime(remaining)}</p>
            <p className="font-mono text-sm text-vt-text-muted">Actual {formatTime(elapsed)} / target {formatTime(active.plannedSeconds)}</p>
            {remaining === 0 ? <p role="status" className="text-sm text-vt-green">Target reached. Finish to save this session. Time stops at the target.</p> : null}
            <div className="flex flex-wrap gap-3">
                {remaining > 0 ? <button className={control} disabled={pending} onClick={() => transition(active.status === 'running' ? 'pause' : 'resume')}>{active.status === 'running' ? 'Pause' : 'Resume'}</button> : null}
                <button className={control + ' text-vt-green'} disabled={pending} onClick={() => transition('finish')}>Finish & save {active.kind === 'work' ? 'actual time' : 'break'}</button>
                <button className={control + ' text-vt-red'} disabled={pending} onClick={() => setDiscard(active.id)}>Discard</button>
            </div>
            {discard === active.id ? <div className="flex flex-wrap items-center gap-3 text-sm"><p>Discard this session? Its time will not count.</p><button className={control + ' text-vt-red'} disabled={pending} onClick={() => transition('cancel')}>Confirm discard</button><button className={control} disabled={pending} onClick={() => setDiscard(null)}>Keep session</button></div> : null}
            <p className="text-xs text-vt-text-muted">The timer survives navigation and reloads. Paused time is excluded. Finishing does not complete the task or change its deadline.</p>
        </div> : <form className="mt-4 space-y-3" onSubmit={(event) => {
            event.preventDefault();
            start(async () => {
                retryId.current ??= crypto.randomUUID();
                try {
                    const result = await startFocus({ id: retryId.current, taskId: kind === 'work' ? taskId || null : null,
                        label: taskId && kind === 'work' ? tasks.find((task) => task.id === taskId)?.title ?? label : label, kind, minutes });
                    setMessage(result.status === 'error' ? result.message : 'Session started.');
                    if (result.status === 'success') retryId.current = null;
                } catch { setMessage('Connection interrupted. Retry to recover your session.'); }
                router.refresh();
            });
        }}>
            <div className="flex flex-wrap gap-3">
                <label className="text-sm">Session <select disabled={pending} className={control + ' ml-2'} value={kind} onChange={(event) => { const next = event.target.value as typeof kind; setKind(next); setMinutes(next === 'work' ? 25 : 5); setLabel(next === 'work' ? 'Deep work' : 'Short break'); }}><option value="work">Work</option><option value="break">Break</option></select></label>
                <label className="text-sm">Minutes <input disabled={pending} className={control + ' ml-2 w-24'} type="number" min={1} max={180} required value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /></label>
            </div>
            {kind === 'work' ? <label className="block text-sm">Source task <select disabled={pending} className={control + ' mt-1 w-full'} value={taskId} onChange={(event) => setTaskId(event.target.value)}><option value="">Unlinked work</option>{tasks.map((task) => <option key={task.id} value={task.id}>{task.title}{task.status === 'done' ? ' (done)' : ''}</option>)}</select></label> : null}
            {kind === 'break' || !taskId ? <label className="block text-sm">Label <input disabled={pending} className={control + ' mt-1 w-full'} required maxLength={200} value={label} onChange={(event) => setLabel(event.target.value)} /></label> : null}
            <button disabled={pending} className={control + ' font-bold text-vt-primary'}>{pending ? 'Saving…' : kind === 'work' ? 'Start work session' : 'Start break'}</button>
            <p className="text-xs text-vt-text-muted">Use 25 minutes of work and a 5 minute break for Pomodoro. Only completed work adds actual time; breaks are saved separately.</p>
        </form>}
        {message ? <p role="status" className="mt-3 text-sm text-vt-primary">{message}</p> : null}
    </section>;
}
