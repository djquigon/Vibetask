'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';

import type { ProfileDetailsActionState } from '../types';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MAX_ASSISTANT_CONTEXT_CHARACTERS = 2000;
const MAX_DISPLAY_NAME_CHARACTERS = 80;
const ALLOWED_AVATAR_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

export async function updateProfileDetails(
    _previousState: ProfileDetailsActionState,
    formData: FormData
): Promise<ProfileDetailsActionState> {
    const displayName = readTrimmedText(formData, 'displayName');
    const assistantContext = readTrimmedText(formData, 'assistantContext');
    const avatar = formData.get('avatar');
    const removeAvatar = formData.get('removeAvatar') === 'on';

    if (displayName.length > MAX_DISPLAY_NAME_CHARACTERS) {
        return errorState(
            `Display name must be ${MAX_DISPLAY_NAME_CHARACTERS} characters or fewer.`
        );
    }

    if (assistantContext.length > MAX_ASSISTANT_CONTEXT_CHARACTERS) {
        return errorState(
            `Assistant context must be ${MAX_ASSISTANT_CONTEXT_CHARACTERS} characters or fewer.`
        );
    }

    if (avatar instanceof File && avatar.size > 0) {
        if (!ALLOWED_AVATAR_TYPES.has(avatar.type)) {
            return errorState('Choose a PNG, JPEG, or WebP profile picture.');
        }

        if (avatar.size > MAX_AVATAR_BYTES) {
            return errorState('Profile pictures must be 5 MB or smaller.');
        }
    }

    const supabase = await createServerSupabaseClient();
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const claims = claimsData?.claims;

    if (claimsError || !claims?.sub) {
        return errorState('Your session has expired. Please sign in again.');
    }

    const { data: existingProfile, error: existingProfileError } = await supabase
        .from('profiles')
        .select('avatar_path')
        .eq('id', claims.sub)
        .maybeSingle();

    if (existingProfileError || !existingProfile) {
        return errorState('Unable to update your profile. Please try again.');
    }

    const hasNewAvatar = avatar instanceof File && avatar.size > 0;
    const avatarPath = `${claims.sub}/avatar`;

    if (hasNewAvatar) {
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(avatarPath, avatar, {
                cacheControl: '3600',
                contentType: avatar.type,
                upsert: true,
            });

        if (uploadError) {
            console.error('Unable to upload profile picture.', uploadError);
            return errorState('Unable to upload your profile picture. Please try again.');
        }
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            display_name: displayName || null,
            assistant_context: assistantContext || null,
            avatar_path: hasNewAvatar
                ? avatarPath
                : removeAvatar
                  ? null
                  : existingProfile.avatar_path,
        })
        .eq('id', claims.sub);

    if (updateError) {
        console.error('Unable to update profile details.', updateError);
        return errorState('Unable to update your profile. Please try again.');
    }

    if (removeAvatar && !hasNewAvatar && existingProfile.avatar_path) {
        const { error: removeError } = await supabase.storage
            .from('avatars')
            .remove([existingProfile.avatar_path]);

        if (removeError) {
            console.error('Unable to remove profile picture.', removeError);
        }
    }

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');

    return {
        message: 'Profile details saved.',
        status: 'success',
    };
}

function errorState(message: string): ProfileDetailsActionState {
    return { message, status: 'error' };
}

function readTrimmedText(formData: FormData, key: string) {
    const value = formData.get(key);
    return typeof value === 'string' ? value.trim() : '';
}
