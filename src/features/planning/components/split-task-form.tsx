'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { splitTask } from '../server/actions';
import type { SplitChild } from '../types';
export function SplitTaskForm({ parentId, drafts, onSaved }: { parentId: string; drafts?: SplitChild[]; onSaved?: () => void }) {
    const router = useRouter();
    const [rows, setRows] = useState<SplitChild[]>(() => drafts ?? [{ id: crypto.randomUUID(), title: '', description: '', estimatedMinutes: 15 }]);
    const [message, setMessage] = useState('');
    const [pending, start] = useTransition();
    return <form className="mt-3 space-y-3 rounded border border-vt-border p-3" onSubmit={(event) => {
        event.preventDefault();
        start(async () => { const result = await splitTask(parentId, rows); setMessage(result.message); if (result.status === 'success') { onSaved?.(); router.refresh(); } });
    }}>
        <p className="text-sm text-vt-text-muted">Review actionable subtasks. They inherit the parent task’s project, priority, and deadline. Estimates replace the parent task’s estimate with their sum.</p>
        {rows.map((row, index) => <fieldset disabled={pending} key={row.id} className="flex flex-wrap items-center gap-2">
            <label className="flex-1 text-sm">Subtask {index + 1}<input required maxLength={200} value={row.title} onChange={(e) => setRows(rows.map((item) => item.id === row.id ? { ...item, title: e.target.value } : item))} className="mt-1 w-full rounded border border-vt-border bg-vt-background p-2" /></label>
            <label className="text-sm">Minutes<input required type="number" min={1} max={10080} value={row.estimatedMinutes} onChange={(e) => setRows(rows.map((item) => item.id === row.id ? { ...item, estimatedMinutes: Number(e.target.value) } : item))} className="ml-2 w-24 rounded border border-vt-border bg-vt-background p-2" /></label>
            <button type="button" disabled={rows.length === 1} onClick={() => setRows(rows.filter((item) => item.id !== row.id))} className="text-sm text-vt-red">Remove</button>
        </fieldset>)}
        <div className="flex gap-4">
            <button type="button" disabled={pending || rows.length >= 20} onClick={() => setRows([...rows, { id: crypto.randomUUID(), title: '', description: '', estimatedMinutes: 15 }])} className="text-sm text-vt-green">Add subtask</button>
            <button disabled={pending} className="rounded bg-vt-primary px-3 py-2 font-bold text-vt-ink">{pending ? 'Saving…' : 'Confirm subtasks'}</button>
        </div>
        {message ? <p role="status" className="text-sm">{message}</p> : null}
    </form>;
}
