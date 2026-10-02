import type { FocusSession } from './types';

export function elapsedSeconds(session: FocusSession, now: number): number {
    const running = session.status === 'running' && session.runningSince
        ? Math.max(0, Math.floor((now - Date.parse(session.runningSince)) / 1000)) : 0;
    return Math.min(session.plannedSeconds, session.elapsedSeconds + running);
}

export function formatTime(seconds: number): string {
    const value = Math.max(0, Math.floor(seconds));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

// Completed work is the single source of actual time. Breaks and discarded sessions never count.
export function actualSeconds(sessions: FocusSession[], taskIds?: string[]): number {
    const ids = taskIds ? new Set(taskIds) : null;
    return sessions.reduce((total, session) => total + (session.kind === 'work' && session.status === 'completed'
        && (!ids || (session.taskId && ids.has(session.taskId))) ? session.elapsedSeconds : 0), 0);
}
