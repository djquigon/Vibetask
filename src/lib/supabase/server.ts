import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { getSupabasePublicConfig } from './config';

export async function createServerSupabaseClient() {
    const cookieStore = await cookies();
    const { url, publishableKey } = getSupabasePublicConfig();

    return createServerClient(url, publishableKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // Server Components cannot write cookies. Step 3 adds the proxy
                    // that refreshes auth sessions where cookie writes are allowed.
                }
            },
        },
    });
}
