import 'server-only';

import { cookies } from 'next/headers';

import { isTheme, THEME_COOKIE_NAME, type Theme } from '../types';

export async function getTheme(): Promise<Theme> {
    const cookieStore = await cookies();
    const storedTheme = cookieStore.get(THEME_COOKIE_NAME)?.value;

    return isTheme(storedTheme) ? storedTheme : 'default';
}
