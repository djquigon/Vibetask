'use server';

import { redirect } from 'next/navigation';

import { getSafeDashboardPath } from '@/lib/auth/redirects';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type AuthPage = '/login' | '/signup' | '/reset-password' | '/update-password';

type AuthErrorDetails = {
    code?: string;
    message: string;
    status?: number;
};

function redirectToAuthPage(
    page: AuthPage,
    params: Record<string, string | undefined>
): never {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            searchParams.set(key, value);
        }
    });

    const query = searchParams.toString();
    redirect(query ? `${page}?${query}` : page);
}

function getEmail(formData: FormData): string | null {
    const value = formData.get('email');

    if (typeof value !== 'string') {
        return null;
    }

    const email = value.trim().toLowerCase();
    return email && email.includes('@') ? email : null;
}

function getPassword(formData: FormData): string | null {
    const value = formData.get('password');
    return typeof value === 'string' && value ? value : null;
}

function getAppUrl() {
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (appUrl) {
        return appUrl;
    }

    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000';
    }

    throw new Error('Missing NEXT_PUBLIC_SITE_URL for Supabase email redirects.');
}

function getCallbackUrl(next: string, flow?: string) {
    const callbackUrl = new URL('/auth/callback', getAppUrl());
    callbackUrl.searchParams.set('next', next);

    if (flow) {
        callbackUrl.searchParams.set('flow', flow);
    }

    return callbackUrl.toString();
}

function getAuthErrorMessage(error: AuthErrorDetails, fallback: string) {
    console.error('Supabase authentication request failed.', {
        code: error.code,
        message: error.message,
        status: error.status,
    });

    if (error.status === 429) {
        return 'Supabase\'s built-in email service has reached its two-emails-per-hour limit. Try again later.';
    }

    return process.env.NODE_ENV === 'development' ? error.message : fallback;
}

export async function login(formData: FormData) {
    const email = getEmail(formData);
    const password = getPassword(formData);
    const next = getSafeDashboardPath(formData.get('next'));

    if (!email || !password) {
        redirectToAuthPage('/login', {
            error: 'Enter both your email and password.',
            next,
        });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        redirectToAuthPage('/login', {
            error: 'We could not sign you in. Check your email and password.',
            next,
        });
    }

    redirect(next);
}

export async function signUp(formData: FormData) {
    const email = getEmail(formData);
    const password = getPassword(formData);
    const next = getSafeDashboardPath(formData.get('next'));
    const nameValue = formData.get('name');
    const displayName = typeof nameValue === 'string' ? nameValue.trim() : '';

    if (!email || !password) {
        redirectToAuthPage('/signup', {
            error: 'Enter an email address and password.',
            next,
        });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: displayName ? { display_name: displayName } : undefined,
            emailRedirectTo: getCallbackUrl(next),
        },
    });

    if (error) {
        redirectToAuthPage('/signup', {
            error: getAuthErrorMessage(
                error,
                'We could not create your account. Please try again.'
            ),
            next,
        });
    }

    if (data.session) {
        redirect(next);
    }

    redirectToAuthPage('/login', {
        message: 'Check your email to confirm your Vibetask account.',
    });
}

export async function requestPasswordReset(formData: FormData) {
    const email = getEmail(formData);

    if (!email) {
        redirectToAuthPage('/reset-password', {
            error: 'Enter the email address for your account.',
        });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getCallbackUrl('/update-password', 'recovery'),
    });

    if (error) {
        redirectToAuthPage('/reset-password', {
            error: getAuthErrorMessage(
                error,
                'We could not send a reset link. Please try again.'
            ),
        });
    }

    redirectToAuthPage('/reset-password', {
        message: 'If an account uses that email, a reset link is on its way.',
    });
}

export async function updatePassword(formData: FormData) {
    const password = getPassword(formData);
    const confirmation = formData.get('passwordConfirmation');

    if (!password || password !== confirmation) {
        redirectToAuthPage('/update-password', {
            error: 'Enter matching passwords.',
        });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        redirectToAuthPage('/update-password', {
            error: 'We could not update your password. Request a new reset link and try again.',
        });
    }

    redirect('/dashboard');
}
