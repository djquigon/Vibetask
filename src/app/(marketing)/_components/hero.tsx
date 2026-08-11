'use client';

import Link from 'next/link';

import { useCurrentUser } from '@/features/profile/hooks/use-current-user';

export function Hero() {
    const currentUser = useCurrentUser();

    return (
        <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-7xl items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
                <p className="mb-5 font-mono text-sm font-bold uppercase tracking-[0.18em] text-vt-green">
                    AI productivity command center
                </p>
                <h1 className="text-5xl font-black leading-[0.95] tracking-normal text-vt-text-strong sm:text-6xl lg:text-7xl">
                    Vibetask plans the day while you stay in motion.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-vt-text-muted">
                    A retro-futuristic workspace for tasks, projects, notes,
                    focus sessions, streaks, and an assistant that can help turn
                    intent into a usable plan.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href={currentUser ? '/dashboard' : '/signup'}
                        className="max-w-full truncate rounded-md bg-vt-primary px-5 py-3 text-center font-bold text-vt-ink transition hover:bg-vt-primary-hover"
                    >
                        {currentUser ? 'View Dashboard' : 'Create account'}
                    </Link>
                    {!currentUser ? (
                        <Link
                            href="/dashboard"
                            className="rounded-md border border-vt-amber/35 px-5 py-3 text-center font-bold text-vt-text transition hover:border-vt-amber/70"
                        >
                            View dashboard
                        </Link>
                    ) : null}
                </div>
            </div>
            <div className="rounded-lg border border-vt-amber/25 bg-vt-surface-alt p-4 shadow-2xl shadow-black/30">
                <div className="rounded-md border border-vt-border bg-vt-surface-raised p-4">
                    <div className="mb-4 flex items-center justify-between border-b border-vt-border-highlight pb-3 font-mono text-sm">
                        <span className="text-vt-primary">
                            TODAY&apos;S PLAN
                        </span>
                        <span className="text-vt-green">VOICE READY</span>
                    </div>
                    {[
                        ['09:00', 'Deep work', 'Build landing page'],
                        ['10:30', 'Standup', 'Team sync'],
                        ['11:30', 'Project', 'Fish Audio voice pass'],
                        ['02:00', 'Notes', 'Organize research'],
                    ].map(([time, type, title]) => (
                        <div
                            key={`${time}-${title}`}
                            className="grid grid-cols-[64px_96px_1fr] gap-3 border-b border-vt-border-muted py-3 font-mono text-sm last:border-0"
                        >
                            <span className="text-vt-amber">{time}</span>
                            <span className="text-vt-green">{type}</span>
                            <span className="text-vt-text-strong">{title}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
