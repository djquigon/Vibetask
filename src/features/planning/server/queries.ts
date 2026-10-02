import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { dateInZone } from '../logic';
import type { DailyPlan, PlanningData } from '../types';
export async function loadPlanningData(): Promise<PlanningData> {
    const client = await createServerSupabaseClient();
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) throw new Error('Please sign in to plan your day.');
    const [settings, plans] = await Promise.all([
        client.from('planning_settings').select('timezone').eq('user_id', auth.user.id).maybeSingle(),
        client.from('daily_plans').select('id,plan_date,timezone,budget_minutes,items,revision').eq('user_id', auth.user.id).order('plan_date', { ascending: false }).limit(90),
    ]);
    if (settings.error || plans.error) {
        console.error('Planning query failed.', settings.error ?? plans.error);
        throw new Error('Unable to load daily planning. Please refresh and try again.');
    }
    const timezone = settings.data?.timezone ?? 'UTC';
    return { timezone, today: dateInZone(timezone), plans: (plans.data ?? []).map((plan): DailyPlan => ({
        id: plan.id, date: plan.plan_date, timezone: plan.timezone, budgetMinutes: plan.budget_minutes, items: plan.items, revision: plan.revision,
    })) };
}
