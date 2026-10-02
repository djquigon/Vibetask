import { taskId } from '@/features/tasks/validation';
import type { FocusAction, FocusDraft } from './types';

export function parseFocusDraft(value: FocusDraft): FocusDraft {
    if (!value || (value.kind !== 'work' && value.kind !== 'break')) throw new Error('Choose work or break.');
    if (!Number.isInteger(value.minutes) || value.minutes < 1 || value.minutes > 180) throw new Error('Choose a duration from 1 to 180 minutes.');
    if (typeof value.label !== 'string' || !value.label.trim() || value.label.trim().length > 200) throw new Error('Enter a session label of 1 to 200 characters.');
    const linkedTask = value.taskId === null ? null : taskId(value.taskId);
    if (value.kind === 'break' && linkedTask) throw new Error('Breaks cannot track task time.');
    return { id: taskId(value.id), taskId: linkedTask, label: value.label.trim(), kind: value.kind, minutes: value.minutes };
}

export function parseTransition(id: string, action: FocusAction, version: number) {
    if (!['pause', 'resume', 'finish', 'cancel'].includes(action)) throw new Error('Invalid focus action.');
    if (!Number.isInteger(version) || version < 0) throw new Error('Refresh your session and try again.');
    return { id: taskId(id), action, version };
}
