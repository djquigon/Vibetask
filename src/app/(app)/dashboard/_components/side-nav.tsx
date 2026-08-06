'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

    return (
        <nav className="flex min-w-0 flex-col rounded-md border border-[#25392f] bg-[#0d1b17] p-3">
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
            <div className="mt-auto rounded-md border border-[#f5bf76]/20 bg-[#08110f] p-3">
                <p className="font-mono text-xs uppercase text-[#f5bf76]">
                    Daily streak
                </p>
                <p className="mt-2 text-3xl font-black text-[#ffb14f]">12</p>
                <p className="text-xs font-bold text-[#50d678]">days active</p>
            </div>
        </nav>
    );
}
