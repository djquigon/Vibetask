export type FocusSession = {
  id: string;
  label: string;
  taskId: string | null;
  kind: 'work' | 'break';
  plannedSeconds: number;
  elapsedSeconds: number;
  status: 'running' | 'paused' | 'completed' | 'cancelled';
  startedAt: string;
  runningSince: string | null;
  endedAt: string | null;
  version: number;
};
export type FocusDraft = { id: string; taskId: string | null; label: string; kind: 'work' | 'break'; minutes: number };
export type FocusAction = 'pause' | 'resume' | 'finish' | 'cancel';
export type FocusActionResult = { status: 'success'; session: FocusSession } | { status: 'error'; message: string };
export type FocusLoadResult = { status: 'ready'; sessions: FocusSession[] } | { status: 'unavailable'; setupRequired: boolean };
