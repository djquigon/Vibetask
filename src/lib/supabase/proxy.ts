import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { getSupabasePublicConfig } from './config';

export async function updateSupabaseSession(request: NextRequest) {
    let response = NextResponse.next({ request });
    const { url, publishableKey } = getSupabasePublicConfig();

    const supabase = createServerClient(url, publishableKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => {
                    request.cookies.set(name, value);
                });

                response = NextResponse.next({ request });

                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    // Keep this immediately after createServerClient so session refreshes work.
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;

    if (!claims?.sub) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set(
            'next',
            `${request.nextUrl.pathname}${request.nextUrl.search}`
        );

        return NextResponse.redirect(loginUrl);
    }

    return response;
}
