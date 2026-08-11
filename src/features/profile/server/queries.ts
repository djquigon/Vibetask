import 'server-only';

import {
    getAssistantMoodOption,
    type AssistantMood,
} from '@/features/assistant/moods';
import { createServerSupabaseClient } from '@/lib/supabase/server';

import type { CurrentUserProfile, ProfileDetails } from '../types';

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
    const supabase = await createServerSupabaseClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const claims = claimsData?.claims;

    if (claimsError || !claims?.sub) {
        return null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select(
            'id, display_name, avatar_path, assistant_active_voice_ids, assistant_mood, daily_login_streak_count, created_at, updated_at'
        )
        .eq('id', claims.sub)
        .maybeSingle();

    if (error) {
        throw new Error('Unable to load the current user profile.');
    }

    if (!data) {
        return null;
    }

    let avatarUrl: string | null = null;

    if (data.avatar_path) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('avatars')
            .createSignedUrl(data.avatar_path, 60 * 60);

        if (signedUrlError) {
            console.error('Unable to create an avatar URL.', signedUrlError);
        } else {
            avatarUrl = signedUrlData.signedUrl;
        }
    }

    return {
        id: data.id,
        email: typeof claims.email === 'string' ? claims.email : null,
        displayName: data.display_name,
        avatarUrl,
        activeVoiceIds: data.assistant_active_voice_ids,
        assistantMood: getAssistantMoodOption(data.assistant_mood).id,
        dailyLoginStreakCount: data.daily_login_streak_count ?? 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

export async function getCurrentUserProfileDetails(): Promise<ProfileDetails | null> {
    const supabase = await createServerSupabaseClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const claims = claimsData?.claims;

    if (claimsError || !claims?.sub) {
        return null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select(
            'display_name, avatar_path, assistant_context, assistant_active_voice_ids, assistant_mood'
        )
        .eq('id', claims.sub)
        .maybeSingle();

    if (error) {
        throw new Error('Unable to load profile details.');
    }

    if (!data) {
        return null;
    }

    let avatarUrl: string | null = null;

    if (data.avatar_path) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('avatars')
            .createSignedUrl(data.avatar_path, 60 * 60);

        if (signedUrlError) {
            console.error('Unable to create an avatar URL.', signedUrlError);
        } else {
            avatarUrl = signedUrlData.signedUrl;
        }
    }

    return {
        displayName: data.display_name,
        email: typeof claims.email === 'string' ? claims.email : null,
        avatarUrl,
        hasAvatar: Boolean(data.avatar_path),
        assistantContext: data.assistant_context,
        activeVoiceIds: data.assistant_active_voice_ids,
        assistantMood: getAssistantMoodOption(data.assistant_mood).id,
    };
}

export async function getCurrentUserAssistantPreferences(): Promise<{
    assistantContext: string | null;
    assistantMood: AssistantMood;
}> {
    const supabase = await createServerSupabaseClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const claims = claimsData?.claims;

    if (claimsError || !claims?.sub) {
        return {
            assistantContext: null,
            assistantMood: 'balanced',
        };
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('assistant_context, assistant_mood')
        .eq('id', claims.sub)
        .maybeSingle();

    if (error) {
        throw new Error('Unable to load assistant context.');
    }

    return {
        assistantContext: data?.assistant_context ?? null,
        assistantMood: getAssistantMoodOption(data?.assistant_mood).id,
    };
}
