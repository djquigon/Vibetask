'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function TaskLoadNotice({ setupRequired }: { setupRequired: boolean }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    return (
        <section className="rounded-md border border-vt-border bg-vt-surface p-5" role="status">
            <h1 className="font-mono text-xl font-black uppercase text-vt-primary">
                {setupRequired ? 'Tasks need setup' : 'Tasks are unavailable'}
            </h1>
            <p className="mt-3 text-sm text-vt-text-muted">
                {setupRequired
                    ? 'Task storage has not been set up yet. Once setup is complete, refresh to load your tasks.'
                    : 'We could not load your tasks. Refresh to try again.'}
            </p>
            <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => router.refresh())}
                className="mt-4 rounded-md bg-vt-primary px-4 py-2 font-bold text-vt-ink disabled:opacity-60"
            >
                {pending ? 'Refreshing…' : 'Refresh tasks'}
            </button>
        </section>
    );
}
