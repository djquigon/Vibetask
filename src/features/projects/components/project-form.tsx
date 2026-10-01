'use client';
import { useActionState, useRef } from 'react';
import { createProject, updateProject } from '../server/actions';
import type { ProjectActionState, ProjectDraft } from '../types';

const initial: ProjectActionState = { status: 'idle', message: '' };

export function ProjectForm({ draft, id, editing = false, onSaved }: {
    draft?: ProjectDraft; id?: string; editing?: boolean; onSaved?: () => void;
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const idRef = useRef(id ?? '');
    const [state, action, pending] = useActionState(async (previous: ProjectActionState, data: FormData) => {
        if (!idRef.current) idRef.current = crypto.randomUUID();
        data.set('id', idRef.current);
        const result = await (editing ? updateProject : createProject)(previous, data);
        if (result.status === 'success') {
            if (!editing && !draft) { formRef.current?.reset(); idRef.current = ''; }
            onSaved?.();
        }
        return result;
    }, initial);
    return (
        <form action={action} ref={formRef} className="space-y-3">
            <fieldset disabled={pending} className="space-y-3">
                <label className="block text-sm text-vt-primary">Project name
                    <input name="name" required maxLength={120} defaultValue={draft?.name ?? ''} className="mt-1 w-full rounded border border-vt-border bg-vt-background p-2 text-vt-text" />
                </label>
                <label className="block text-sm text-vt-primary">Details
                    <textarea name="description" maxLength={2000} defaultValue={draft?.description ?? ''} className="mt-1 w-full rounded border border-vt-border bg-vt-background p-2 text-vt-text" />
                </label>
                <div className="flex flex-wrap gap-3">
                    <label className="text-sm text-vt-primary">Start date
                        <input name="startDate" type="date" defaultValue={draft?.startDate ?? ''} className="ml-2 rounded border border-vt-border bg-vt-background p-2 text-vt-text" />
                    </label>
                    <label className="text-sm text-vt-primary">Due date
                        <input name="dueDate" type="date" defaultValue={draft?.dueDate ?? ''} className="ml-2 rounded border border-vt-border bg-vt-background p-2 text-vt-text" />
                    </label>
                </div>
                <p className="text-xs text-vt-text-muted">Dates appear on your calendar. A start and due date show the project timeline.</p>
                <button type="submit" className="rounded bg-vt-primary px-4 py-2 font-bold text-vt-ink disabled:opacity-60">{pending ? 'Saving…' : editing ? 'Save changes' : draft ? 'Confirm and create project' : 'Create project'}</button>
            </fieldset>
            {state.message ? <p role="status" className={state.status === 'error' ? 'text-vt-red' : 'text-vt-green'}>{state.message}</p> : null}
        </form>
    );
}
