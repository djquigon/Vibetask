export function FocusLoadNotice({ setupRequired }: { setupRequired: boolean }) {
    return <p role="alert" className="rounded border border-vt-border bg-vt-surface p-4 text-sm text-vt-primary">
        {setupRequired ? 'Focus storage needs setup. Apply all Supabase migrations in filename order, then refresh.' : 'Unable to load focus time. Refresh to try again.'}
    </p>;
}
