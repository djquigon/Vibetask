import 'server-only';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import type { CurrentUserProfile } from '../types';

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
    const supabase = await createServerSupabaseClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const claims = claimsData?.claims;

    if (claimsError || !claims?.sub) {
        return null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, created_at, updated_at')
        .eq('id', claims.sub)
        .maybeSingle();

    if (error) {
        throw new Error('Unable to load the current user profile.');
    }

    if (!data) {
        return null;
    }

    return {
        id: data.id,
        email: typeof claims.email === 'string' ? claims.email : null,
        displayName: data.display_name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}
