'use server';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { parsePlanInput, parseSplitChildren, planningTimezone } from '../validation';
import { taskId } from '@/features/tasks/validation';
import type { PlanInput, PlanningState, SplitChild } from '../types';
async function client() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error('Your session expired. Please sign in.');
    return { supabase, userId: data.user.id };
}
function failed(error: unknown): PlanningState { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to save.' }; }
export async function saveDailyPlan(input: PlanInput): Promise<PlanningState> {
    try {
        const draft = parsePlanInput(input);
        const { supabase } = await client();
        const { error } = await supabase.rpc('save_daily_plan', { p_date: draft.date, p_timezone: draft.timezone, p_budget: draft.budgetMinutes, p_items: draft.items, p_revision: draft.revision });
        if (error) throw new Error(error.code === 'P0001' ? error.message : 'Unable to save your plan. Please refresh and try again.');
        revalidatePath('/dashboard', 'layout');
        return { status: 'success', message: 'Daily plan saved.' };
    } catch (error) { return failed(error); }
}
export async function savePlanningTimezone(timezone: string): Promise<PlanningState> {
    try {
        const zone = planningTimezone(timezone);
        const { supabase, userId } = await client();
        const { error: insertError } = await supabase.from('planning_settings').upsert({ user_id: userId, timezone: zone }, { onConflict: 'user_id', ignoreDuplicates: true });
        if (insertError) throw new Error('Unable to save your timezone.');
        const { data, error } = await supabase.from('planning_settings').update({ timezone: zone }).eq('user_id', userId).select('user_id').maybeSingle();
        if (error || !data) throw new Error('Unable to save your timezone.');
        revalidatePath('/dashboard', 'layout');
        return { status: 'success', message: 'Timezone saved. Existing plans keep their original timezone.' };
    } catch (error) { return failed(error); }
}
export async function splitTask(parentId: string, children: SplitChild[]): Promise<PlanningState> {
    try {
        const id = taskId(parentId), drafts = parseSplitChildren(children);
        const { supabase } = await client();
        const { error } = await supabase.rpc('split_task', { p_parent: id, p_children: drafts });
        if (error) throw new Error(error.code === 'P0001' ? error.message : 'Unable to save subtasks. Please try again.');
        revalidatePath('/dashboard', 'layout');
        return { status: 'success', message: 'Subtasks saved. Their estimates now roll up to the parent.' };
    } catch (error) { return failed(error); }
}
