import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { focusSession } from './records';
import type { FocusLoadResult, FocusSession } from '../types';

export async function loadFocusSessions(): Promise<FocusLoadResult> {
    const supabase = await createServerSupabaseClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error('Please sign in to view focus sessions.');
    // Page in full so task/project totals never silently stop at the REST row limit.
    const sessions: FocusSession[] = [];
    for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from('focus_sessions')
            .select('id, task_id, label, kind, planned_seconds, elapsed_seconds, status, started_at, running_since, ended_at, version')
            .eq('user_id', auth.user.id).order('started_at', { ascending: false }).order('id').range(offset, offset + 499);
        if (error) {
            console.error('Focus query failed.', { code: error.code, message: error.message });
            return { status: 'unavailable', setupRequired: ['PGRST205', '42P01', 'PGRST204', '42703'].includes(error.code) };
        }
        sessions.push(...(data ?? []).map(focusSession));
        if (!data || data.length < 500) break;
    }
    return { status: 'ready', sessions };
}
