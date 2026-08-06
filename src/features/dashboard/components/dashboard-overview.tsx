const plan = [
    ['09:00 AM', 'Focus Session', 'Build dashboard shell'],
    ['10:30 AM', 'Team Standup', '30 min'],
    ['11:30 AM', 'Deep Work', 'Design system updates'],
    ['02:00 PM', 'Project', 'ElevenLabs app'],
    ['04:30 PM', 'Admin', 'Review analytics'],
];

export function DashboardOverview() {
    return (
        <div className="space-y-4">
            <section className="grid gap-3 rounded-md border border-[#f5bf76]/25 bg-[#f7d99b] p-4 text-[#08110f] md:grid-cols-[1fr_160px]">
                <div>
                    <h1 className="font-mono text-4xl font-black uppercase">
                        Good morning, Logan
                    </h1>
                    <p className="mt-2 font-mono text-sm">
                        Let us make today ridiculously productive.
                    </p>
                </div>
                <div className="rounded-md border border-[#7c4c2d]/30 p-3 font-mono">
                    <p className="text-xs font-bold uppercase">Current time</p>
                    <p className="text-3xl font-black">09:42</p>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-4">
                {['Capture', 'Plan my day', 'Prioritize', 'Brain dump'].map(
                    (item) => (
                        <div
                            key={item}
                            className="rounded-md border border-[#f5bf76]/20 bg-[#0d1b17] p-4"
                        >
                            <p className="font-mono text-lg font-black uppercase text-[#ff7b39]">
                                {item}
                            </p>
                            <p className="mt-2 text-sm text-[#d8c79f]">
                                Start a focused assistant workflow.
                            </p>
                        </div>
                    )
                )}
            </section>

            <section className="rounded-md border border-[#25392f] bg-[#0d1b17] p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-mono text-xl font-black uppercase text-[#f5bf76]">
                        Today&apos;s plan
                    </h2>
                    <span className="font-mono text-xs text-[#50d678]">
                        Thursday
                    </span>
                </div>
                <div className="divide-y divide-[#25392f]">
                    {plan.map(([time, type, title]) => (
                        <div
                            key={`${time}-${title}`}
                            className="grid grid-cols-[90px_140px_1fr_24px] gap-3 py-3 font-mono text-sm"
                        >
                            <span className="text-[#f5bf76]">{time}</span>
                            <span className="text-[#ff7b39]">{type}</span>
                            <span className="text-[#fff0c8]">{title}</span>
                            <span className="h-5 w-5 rounded-full border border-[#f5bf76]" />
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
        <div className="rounded-md border border-[#25392f] bg-[#0d1b17] p-4">
            <p className="font-mono text-sm font-bold uppercase text-[#f5bf76]">
                {title}
            </p>
            <p className="mt-4 font-mono text-4xl font-black text-[#ffb14f]">
                {value}
            </p>
            <p className="mt-1 text-sm text-[#d8c79f]">{caption}</p>
        </div>
    );
}
