'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/features/profile/hooks/use-current-user';
import { WinampPlayer } from './winamp-player';

const navItems = [
    ['Dashboard', '/dashboard'],
    ['Tasks', '/dashboard/tasks'],
    ['Projects', '/dashboard/projects'],
    ['Calendar', '/dashboard/calendar'],
    ['Focus', '/dashboard/focus'],
    ['Notes', '/dashboard/notes'],
    ['Habits', '/dashboard/habits'],
    ['Analytics', '/dashboard/analytics'],
    ['Settings', '/dashboard/settings'],
] as const;

export function SideNav() {
    const pathname = usePathname();
    const currentUser = useCurrentUser();
    const displayName = currentUser?.displayName || 'Vibetask user';
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return (
        <nav className="flex min-h-0 min-w-0 flex-col rounded-md border border-[#25392f] bg-[#0d1b17] p-3">
            <Link
                href="/"
                className="mb-5 font-mono text-3xl font-black uppercase text-[#ff7b39]"
            >
                Vibetask
            </Link>
            <div className="space-y-1">
                {navItems.map(([label, href]) => {
                    const isActive =
                        href === '/dashboard'
                            ? pathname === href
                            : pathname.startsWith(href);

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`block rounded-md px-3 py-2 font-mono text-sm font-bold transition ${
                                isActive
                                    ? 'bg-[#ff7b39] text-[#08110f]'
                                    : 'text-[#f8e8c0] hover:bg-[#172721]'
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
            <div className="mt-auto flex flex-col gap-3 pt-3">
                <WinampPlayer />
                <Link
                    aria-label="Open profile settings"
                    className="group shrink-0 rounded-md border border-[#f5bf76]/20 bg-[#08110f] p-3 transition hover:border-[#50d678]/60 hover:bg-[#0f211a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#50d678]"
                    href="/dashboard/settings"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            aria-label={`${displayName}'s profile picture`}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#50d678]/40 bg-[#102a1d] bg-cover bg-center font-mono text-lg font-black text-[#50d678]"
                            role="img"
                            style={
                                currentUser?.avatarUrl
                                    ? {
                                          backgroundImage: `url(${currentUser.avatarUrl})`,
                                      }
                                    : undefined
                            }
                        >
                            {currentUser?.avatarUrl ? null : avatarInitial}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-mono text-sm font-black uppercase text-[#f8e8c0] group-hover:text-[#ffb14f]">
                                {displayName}
                            </p>
                            <p className="truncate font-mono text-xs text-[#a99e80]">
                                {currentUser?.email ?? 'No email available'}
                            </p>
                        </div>
                    </div>
                </Link>
                <div className="shrink-0 rounded-md border border-[#f5bf76]/20 bg-[#08110f] p-3">
                    <p className="font-mono text-xs uppercase text-[#f5bf76]">
                        Daily streak
                    </p>
                    <p className="mt-2 text-3xl font-black text-[#ffb14f]">
                        {currentUser?.dailyLoginStreakCount ?? 0}
                    </p>
                    <p className="text-xs font-bold text-[#50d678]">
                        days active
                    </p>
                </div>
            </div>
        </nav>
    );
}
