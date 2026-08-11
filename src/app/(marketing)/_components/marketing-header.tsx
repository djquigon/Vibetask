'use client';

import Link from 'next/link';

import { useCurrentUser } from '@/features/profile/hooks/use-current-user';

export function MarketingHeader() {
    const currentUser = useCurrentUser();
    const accountLabel = currentUser?.displayName || currentUser?.email || 'Dashboard';

    return (
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
            <Link
                href="/"
                className="font-mono text-2xl font-black uppercase tracking-wide text-vt-orange"
            >
                Vibetask
            </Link>
            <nav className="flex items-center gap-3 text-sm font-semibold">
                {currentUser ? (
                    <Link
                        href="/dashboard"
                        className="inline-flex max-w-48 items-center rounded-md bg-vt-orange px-4 py-2 text-vt-ink transition hover:bg-vt-orange-hover"
                    >
                        <span className="truncate">{accountLabel}</span>
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="rounded-md border border-vt-amber/25 px-4 py-2 text-vt-text transition hover:border-vt-amber/60"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="rounded-md bg-vt-orange px-4 py-2 text-vt-ink transition hover:bg-vt-orange-hover"
                        >
                            Sign up
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
