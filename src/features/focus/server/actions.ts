'use server';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { parseFocusDraft, parseTransition } from '../validation';
import { focusSession } from './records';
import type { FocusAction, FocusActionResult, FocusDraft } from '../types';

async function account() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error('Your session expired. Please sign in.');
    return supabase;
}

export async function startFocus(input: FocusDraft): Promise<FocusActionResult> {
    try {
        const draft = parseFocusDraft(input);
        const supabase = await account();
        const { data, error } = await supabase.rpc('start_focus_session', {
            p_id: draft.id, p_task_id: draft.taskId, p_label: draft.label, p_kind: draft.kind, p_minutes: draft.minutes,
        });
        if (error || !data) throw new Error(error?.message ?? 'Unable to start focus. Please try again.');
        revalidatePath('/dashboard', 'layout');
        return { status: 'success', session: focusSession(data) };
    } catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to start focus.' }; }
}

export async function transitionFocus(id: string, action: FocusAction, version: number): Promise<FocusActionResult> {
    try {
        const input = parseTransition(id, action, version);
        const supabase = await account();
        const { data, error } = await supabase.rpc('transition_focus_session', { p_id: input.id, p_action: input.action, p_version: input.version });
        if (error || !data) throw new Error(error?.message ?? 'Unable to update focus. Please refresh and try again.');
        revalidatePath('/dashboard', 'layout');
        return { status: 'success', session: focusSession(data) };
    } catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to update focus.' }; }
}
