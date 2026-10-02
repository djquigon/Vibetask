'use client';
export default function DashboardError({ reset }: { reset: () => void }) {
    return <div role="alert" className="rounded border border-vt-border bg-vt-surface p-4">
        <h2 className="font-mono text-lg text-vt-primary">Unable to load this view</h2>
        <p className="mt-2 text-sm">Your data could not be loaded. Please try again.</p>
        <button type="button" onClick={reset} className="mt-3 rounded bg-vt-primary px-3 py-2 text-vt-ink">Retry</button>
    </div>;
}
