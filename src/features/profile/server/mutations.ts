import 'server-only';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function recordCurrentUserDailyLoginStreak() {
    const supabase = await createServerSupabaseClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

    if (claimsError || !claimsData?.claims?.sub) {
        return;
    }

    const { error } = await supabase.rpc('record_daily_login_streak');

    if (error) {
        console.error('Unable to record the daily login streak.', error);
    }
}
