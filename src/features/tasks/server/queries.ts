import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Task } from '../types';

class TaskDataError extends Error {
    readonly setupRequired: boolean;
    constructor(setupRequired: boolean) {
        super('Unable to load your tasks. Please try again.');
        this.setupRequired = setupRequired;
    }
}

export type TaskLoadResult =
    | { status: 'ready'; tasks: Task[] }
    | { status: 'unavailable'; setupRequired: boolean };

// Distinguish unavailable data from a genuinely empty task list.
export async function loadTasksForPage(): Promise<TaskLoadResult> {
    try {
        return { status: 'ready', tasks: await listTasks() };
    } catch (error) {
        if (!(error instanceof TaskDataError)) throw error;
        return { status: 'unavailable', setupRequired: error.setupRequired };
    }
}

export async function listTasks(): Promise<Task[]> {
    const supabase = await createServerSupabaseClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error('Please sign in to view tasks.');
    const { data, error } = await supabase.from('tasks')
        .select('id, user_id, title, description, status, priority, due_date, project_id, estimated_minutes, parent_id, archived_at, created_at, updated_at')
        .eq('user_id', auth.user.id).order('created_at', { ascending: false });
    if (error) {
        console.error('Task query failed.', { code: error.code, message: error.message });
        throw new TaskDataError(['PGRST205', '42P01', 'PGRST204', '42703'].includes(error.code));
    }
    return (data ?? []).map((row) => ({
        id: row.id, userId: row.user_id, title: row.title, description: row.description,
        status: row.status, priority: row.priority, dueDate: row.due_date,
        projectId: row.project_id,
        estimatedMinutes: row.estimated_minutes, parentId: row.parent_id, archivedAt: row.archived_at,
        createdAt: row.created_at, updatedAt: row.updated_at,
    }));
}
