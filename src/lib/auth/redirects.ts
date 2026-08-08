function normalizeInternalPath(value: string): string | null {
    if (!value.startsWith('/') || value.startsWith('//')) {
        return null;
    }

    const url = new URL(value, 'https://vibetask.local');

    return `${url.pathname}${url.search}`;
}

export function getSafeDashboardPath(
    value: FormDataEntryValue | string | null | undefined
) {
    if (typeof value !== 'string') {
        return '/dashboard';
    }

    const path = normalizeInternalPath(value);

    if (path === '/dashboard' || path?.startsWith('/dashboard/')) {
        return path;
    }

    return '/dashboard';
}

export function getSafeCallbackPath(value: string | null) {
    if (value === '/update-password') {
        return value;
    }

    return getSafeDashboardPath(value);
}
