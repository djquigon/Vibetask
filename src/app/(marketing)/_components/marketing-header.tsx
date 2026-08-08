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
                className="font-mono text-2xl font-black uppercase tracking-wide text-[#ff7b39]"
            >
                Vibetask
            </Link>
            <nav className="flex items-center gap-3 text-sm font-semibold">
                {currentUser ? (
                    <Link
                        href="/dashboard"
                        className="inline-flex max-w-48 items-center rounded-md bg-[#ff7b39] px-4 py-2 text-[#08110f] transition hover:bg-[#ff9a56]"
                    >
                        <span className="truncate">{accountLabel}</span>
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="rounded-md border border-[#f5bf76]/25 px-4 py-2 text-[#f8e8c0] transition hover:border-[#f5bf76]/60"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="rounded-md bg-[#ff7b39] px-4 py-2 text-[#08110f] transition hover:bg-[#ff9a56]"
                        >
                            Sign up
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
