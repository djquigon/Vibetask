import type { FocusSession } from '../types';

export type FocusRecord = {
    id: string; task_id: string | null; label: string; kind: FocusSession['kind'];
    planned_seconds: number; elapsed_seconds: number; status: FocusSession['status'];
    started_at: string; running_since: string | null; ended_at: string | null; version: number;
};

export function focusSession(row: FocusRecord): FocusSession {
    return { id: row.id, taskId: row.task_id, label: row.label, kind: row.kind,
        plannedSeconds: row.planned_seconds, elapsedSeconds: row.elapsed_seconds, status: row.status,
        startedAt: row.started_at, runningSince: row.running_since, endedAt: row.ended_at, version: row.version };
}
