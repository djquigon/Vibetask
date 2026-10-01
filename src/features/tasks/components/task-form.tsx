'use client';
import { useActionState, useRef } from 'react';
import { createTask, updateTask } from '../server/actions';
import type { TaskActionState, TaskDraft } from '../types';
import type { ProjectOption } from '@/features/projects/types';

const initial: TaskActionState = { status: 'idle', message: '' };

export function TaskForm({ draft, id, editing = false, onSaved, projects = [], defaultProjectId = null }: {
    draft?: TaskDraft; id?: string; editing?: boolean; onSaved?: () => void; projects?: ProjectOption[]; defaultProjectId?: string | null;
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const idRef = useRef(id ?? '');
    const [state, action, pending] = useActionState(async (previous: TaskActionState, data: FormData) => {
        if (!idRef.current) idRef.current = crypto.randomUUID();
        data.set('id', idRef.current);
        const result = await (editing ? updateTask : createTask)(previous, data);
        if (result.status === 'success') {
            if (!editing && !draft) { formRef.current?.reset(); idRef.current = ''; }
            onSaved?.();
        }
        return result;
    }, initial);
    return (
        <form action={action} ref={formRef} className="space-y-3">
            <fieldset disabled={pending} className="space-y-3">
                <label className="block text-sm text-vt-primary">Title
                    <input name="title" required maxLength={200} defaultValue={draft?.title ?? ''} className="mt-1 w-full rounded border border-vt-border bg-vt-background p-2 text-vt-text" />
                </label>
                <label className="block text-sm text-vt-primary">Details
                    <textarea name="description" maxLength={2000} defaultValue={draft?.description ?? ''} className="mt-1 w-full rounded border border-vt-border bg-vt-background p-2 text-vt-text" />
                </label>
                <div className="flex flex-wrap gap-3">
                    <label className="text-sm text-vt-primary">Project
                        <select name="projectId" defaultValue={draft?.projectId ?? defaultProjectId ?? ''} className="ml-2 rounded border border-vt-border bg-vt-background p-2 text-vt-text">
                            <option value="">No project</option>
                            {projects.filter((project) => project.status === 'active' || project.id === (draft?.projectId ?? defaultProjectId)).map((project) => <option key={project.id} value={project.id}>{project.name}{project.status === 'archived' ? ' (archived)' : ''}</option>)}
                        </select>
                    </label>
                    <label className="text-sm text-vt-primary">Priority
                        <select name="priority" defaultValue={draft?.priority ?? 'normal'} className="ml-2 rounded border border-vt-border bg-vt-background p-2 text-vt-text">
                            <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
                        </select>
                    </label>
                    <label className="text-sm text-vt-primary">Due date
                        <input name="dueDate" type="date" defaultValue={draft?.dueDate ?? ''} className="ml-2 rounded border border-vt-border bg-vt-background p-2 text-vt-text" />
                    </label>
                </div>
                <button type="submit" className="rounded bg-vt-primary px-4 py-2 font-bold text-vt-ink disabled:opacity-60">{pending ? 'Saving…' : editing ? 'Save changes' : draft ? 'Confirm and create task' : 'Add task'}</button>
            </fieldset>
            {state.message ? <p role="status" className={state.status === 'error' ? 'text-vt-red' : 'text-vt-green'}>{state.message}</p> : null}
        </form>
    );
}
