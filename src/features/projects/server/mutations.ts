import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { parseProjectDraft, projectId } from '../validation';
import type { ProjectDraft } from '../types';

async function account() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error('Your session expired. Please sign in.');
    return { supabase, userId: data.user.id };
}

export async function saveProject(id: string, input: ProjectDraft) {
    const draft = parseProjectDraft(input);
    const validatedId = projectId(id);
    const { supabase, userId } = await account();
    const { error } = await supabase.from('projects').upsert({
        id: validatedId, user_id: userId, name: draft.name, description: draft.description,
        start_date: draft.startDate, due_date: draft.dueDate,
    }, { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw new Error('Unable to save the project. Please try again.');
    const { data, error: readError } = await supabase.from('projects').select('id').eq('id', validatedId).eq('user_id', userId).maybeSingle();
    if (readError || !data) throw new Error('Unable to save the project. Please try again.');
    return data.id as string;
}

export async function editProject(id: string, input: ProjectDraft) {
    const draft = parseProjectDraft(input);
    const { supabase, userId } = await account();
    const { data, error } = await supabase.from('projects').update({
        name: draft.name, description: draft.description, start_date: draft.startDate, due_date: draft.dueDate,
    }).eq('id', projectId(id)).eq('user_id', userId).select('id').maybeSingle();
    if (error || !data) throw new Error('Unable to update the project. Please refresh and try again.');
}

export async function setProjectStatus(id: string, status: unknown) {
    if (status !== 'active' && status !== 'archived') throw new Error('Invalid project status.');
    const { supabase, userId } = await account();
    const { data, error } = await supabase.from('projects').update({ status })
        .eq('id', projectId(id)).eq('user_id', userId).select('id').maybeSingle();
    if (error || !data) throw new Error('Unable to update the project. Please refresh and try again.');
}
