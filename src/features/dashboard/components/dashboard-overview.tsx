'use client';

const plan = [
    ['09:00 AM', 'Focus Session', 'Build dashboard shell'],
    ['10:30 AM', 'Team Standup', '30 min'],
    ['11:30 AM', 'Deep Work', 'Design system updates'],
    ['02:00 PM', 'Project', 'Fish Audio app'],
    ['04:30 PM', 'Admin', 'Review analytics'],
];

import { useCurrentUser } from '@/features/profile/hooks/use-current-user';

export function DashboardOverview() {
    const currentUser = useCurrentUser();

    return (
        <div className="space-y-4">
            <section className="grid gap-3 rounded-md border border-vt-amber/25 bg-vt-display p-4 text-vt-ink md:grid-cols-[1fr_160px]">
                <div>
                    <h1 className="font-mono text-5xl font-black uppercase">
                        Good morning, {currentUser?.displayName}
                    </h1>
                    <p className="mt-2 font-mono text-sm">
                        Let us make today ridiculously productive.
                    </p>
                </div>
                <div className="rounded-md border border-vt-border-strong/30 p-3 font-mono">
                    <p className="text-xs font-bold uppercase">Current time</p>
                    <p className="text-2xl font-black">
                        {new Date().toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'UTC',
                        })}{' '}
                        UTC
                    </p>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-4">
                {['Capture', 'Plan my day', 'Prioritize', 'Brain dump'].map(
                    (item) => (
                        <div
                            key={item}
                            className="rounded-md border border-vt-amber/20 bg-vt-surface p-4"
                        >
                            <p className="font-mono text-lg font-black uppercase text-vt-primary">
                                {item}
                            </p>
                            <p className="mt-2 text-sm text-vt-text-muted">
                                Start a focused assistant workflow.
                            </p>
                        </div>
                    )
                )}
            </section>

            <section className="rounded-md border border-vt-border bg-vt-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-mono text-xl font-black uppercase text-vt-amber">
                        Today&apos;s plan
                    </h2>
                    <span className="font-mono text-xs text-vt-green">
                        Thursday
                    </span>
                </div>
                <div className="divide-y divide-vt-border">
                    {plan.map(([time, type, title]) => (
                        <div
                            key={`${time}-${title}`}
                            className="grid grid-cols-[90px_140px_1fr_24px] gap-3 py-3 font-mono text-sm"
                        >
                            <span className="text-vt-amber">{time}</span>
                            <span className="text-vt-primary">{type}</span>
                            <span className="text-vt-text-strong">{title}</span>
                            <span className="h-5 w-5 rounded-full border border-vt-amber" />
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
                <Metric
                    title="Tasks overview"
                    value="24"
                    caption="total tasks"
                />
                <Metric
                    title="Focus session"
                    value="25:00"
                    caption="deep work"
                />
                <Metric
                    title="Today's progress"
                    value="75%"
                    caption="6 of 8 tasks"
                />
            </section>
        </div>
    );
}

function Metric({
    title,
    value,
    caption,
}: {
    title: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="rounded-md border border-vt-border bg-vt-surface p-4">
            <p className="font-mono text-sm font-bold uppercase text-vt-amber">
                {title}
            </p>
            <p className="mt-4 font-mono text-4xl font-black text-vt-gold">
                {value}
            </p>
            <p className="mt-1 text-sm text-vt-text-muted">{caption}</p>
        </div>
    );
}
