import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { parseTaskDraft, taskId, taskStatus } from '../validation';
import type { TaskDraft } from '../types';

async function account() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error('Your session expired. Please sign in.');
    return { supabase, userId: data.user.id };
}

export async function saveTask(id: string, input: TaskDraft) {
    const draft = parseTaskDraft(input);
    const validatedId = taskId(id);
    const { supabase, userId } = await account();
    // A stable client ID makes retries and repeated assistant confirmations idempotent.
    const { error } = await supabase.from('tasks').upsert({
        id: validatedId, user_id: userId, title: draft.title, description: draft.description,
        priority: draft.priority, due_date: draft.dueDate, project_id: draft.projectId, estimated_minutes: draft.estimatedMinutes,
    }, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw new Error('Unable to save the task. Please try again.');
    const { data, error: readError } = await supabase.from('tasks').select('id').eq('id', validatedId).eq('user_id', userId).maybeSingle();
    if (readError || !data) throw new Error('Unable to save the task. Please try again.');
    return data.id as string;
}

export async function editTask(id: string, input: TaskDraft) {
    const draft = parseTaskDraft(input);
    const { supabase, userId } = await account();
    const { data, error } = await supabase.from('tasks').update({
        title: draft.title, description: draft.description, priority: draft.priority, due_date: draft.dueDate, project_id: draft.projectId, estimated_minutes: draft.estimatedMinutes,
    }).eq('id', taskId(id)).eq('user_id', userId).select('id').maybeSingle();
    if (error || !data) throw new Error(error?.code === 'P0001' ? error.message : 'Unable to update the task. Please refresh and try again.');
}

export async function setTaskStatus(id: string, status: unknown) {
    const validatedStatus = taskStatus(status);
    const { supabase, userId } = await account();
    const { data, error } = await supabase.from('tasks').update({ status: validatedStatus })
        .eq('id', taskId(id)).eq('user_id', userId).select('id').maybeSingle();
    if (error || !data) throw new Error(error?.code === 'P0001' ? error.message : 'Unable to update the task. Please refresh and try again.');
}

export async function removeTask(id: string) {
    const { supabase, userId } = await account();
    const { data, error } = await supabase.from('tasks').delete().eq('id', taskId(id)).eq('user_id', userId).select('id').maybeSingle();
    if (error || !data) throw new Error('Unable to delete the task. Please refresh and try again.');
}

export async function setTaskProject(id: string, projectId: string | null) {
    const validatedProject = projectId === null ? null : taskId(projectId);
    const { supabase, userId } = await account();
    const { data, error } = await supabase.from('tasks').update({ project_id: validatedProject })
        .eq('id', taskId(id)).eq('user_id', userId).select('id').maybeSingle();
    if (error || !data) throw new Error('Unable to link the task. Please refresh and choose an available project.');
}

export async function setTaskArchived(id: string, archived: boolean) {
    if (typeof archived !== 'boolean') throw new Error('Invalid archive action.');
    const { supabase, userId } = await account();
    const { data, error } = await supabase.from('tasks').update({ archived_at: archived ? new Date().toISOString() : null })
        .eq('id', taskId(id)).eq('user_id', userId).select('id').maybeSingle();
    if (error || !data) throw new Error('Unable to archive or restore this task.');
}
