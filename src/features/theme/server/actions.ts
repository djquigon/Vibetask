'use server';

import { cookies } from 'next/headers';

import { isTheme, THEME_COOKIE_NAME, type Theme } from '../types';

export async function updateTheme(theme: Theme) {
    if (!isTheme(theme)) {
        throw new Error('Unknown color theme.');
    }

    const cookieStore = await cookies();

    cookieStore.set(THEME_COOKIE_NAME, theme, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
}
