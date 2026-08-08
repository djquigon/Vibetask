import { type NextRequest, NextResponse } from 'next/server';

import { getSafeCallbackPath } from '@/lib/auth/redirects';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const next = getSafeCallbackPath(request.nextUrl.searchParams.get('next'));
    const flow = request.nextUrl.searchParams.get('flow');

    if (code) {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(new URL(next, request.url));
        }

        if (flow === 'recovery' && error.code === 'bad_code_verifier') {
            const resetUrl = new URL('/reset-password', request.url);
            resetUrl.searchParams.set(
                'error',
                'Open a newly requested reset link in the same browser you used to request it.'
            );

            return NextResponse.redirect(resetUrl);
        }
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
        'error',
        'We could not verify that sign-in link. Please try again.'
    );

    return NextResponse.redirect(loginUrl);
}
