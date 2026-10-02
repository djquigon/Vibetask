'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Task } from '@/features/tasks/types';
import type { Project } from '@/features/projects/types';
import { changeTaskStatus } from '@/features/tasks/server/actions';
import { planningCandidates, taskEstimate, planTotals, overlaps, suggestedTasks, dateInZone } from '../logic';
import { scheduledInstant, scheduledLocal } from '../scheduling';
import { saveDailyPlan, savePlanningTimezone } from '../server/actions';
import { SplitTaskForm } from './split-task-form';
import type { DailyPlan, PlanningData, PlanItem } from '../types';

const control = 'rounded border border-vt-border bg-vt-background p-2 text-vt-text';
export function DailyPlanner({ data, tasks, projects, initialDate, onSaved }: { data: PlanningData; tasks: Task[]; projects: Project[]; initialDate?: string; onSaved?: () => void }) {
    const [date, setDate] = useState(initialDate ?? data.today);
    const [timezone, setTimezone] = useState(data.timezone);
    const [message, setMessage] = useState('');
    const [pending, start] = useTransition();
    const plan = data.plans.find((value) => value.date === date);
    return <section className="space-y-4 rounded border border-vt-border-strong bg-vt-surface p-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-mono text-xl font-black uppercase text-vt-primary">Daily plan</h2>
            <label className="text-sm">Date <input type="date" value={date} onChange={(e) => setDate(e.target.value || data.today)} className={control} /></label>
        </header>
        <details>
            <summary className="cursor-pointer text-sm text-vt-green">Planning timezone: {data.timezone}</summary>
            <form className="mt-2 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { const result = await savePlanningTimezone(timezone); setMessage(result.message); }); }}>
                <label className="text-sm">Timezone <input list="planning-timezones" value={timezone} onChange={(e) => setTimezone(e.target.value)} className={control} /></label>
                <datalist id="planning-timezones">{['UTC', ...Intl.supportedValuesOf('timeZone')].map((zone) => <option key={zone} value={zone} />)}</datalist>
                <button type="button" className="text-sm text-vt-green" onClick={() => setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)}>Use device timezone</button>
                <button disabled={pending} className="text-sm text-vt-primary">Save timezone</button>
            </form>
            <p className="mt-2 text-xs text-vt-text-muted">New plans use this timezone. Existing plans keep theirs. Default is UTC until you choose one.</p>
        </details>
        {message ? <p role="status" className="text-sm">{message}</p> : null}
        {onSaved ? <p className="text-sm text-vt-primary">Review before saving: this replaces the selected day’s ordered plan and work blocks. Task deadlines stay unchanged.</p> : null}
        <PlanEditor key={date + ':' + (plan?.revision ?? 0) + ':' + data.timezone} plan={plan} date={date} timezone={plan?.timezone ?? data.timezone} tasks={tasks} projects={projects} plans={data.plans} onSaved={onSaved} />
    </section>;
}
function PlanEditor({ plan, date, timezone, tasks, projects, plans, onSaved }: { plan?: DailyPlan; date: string; timezone: string; tasks: Task[]; projects: Project[]; plans: DailyPlan[]; onSaved?: () => void }) {
    const router = useRouter();
    const [draftItems, setItems] = useState<PlanItem[]>(plan?.items ?? []);
    const [budget, setBudget] = useState(plan?.budgetMinutes?.toString() ?? '');
    const [message, setMessage] = useState('');
    const [split, setSplit] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    const [pending, start] = useTransition();
    const past = date < dateInZone(timezone);
    const items = past ? draftItems : draftItems.map((item) => {
        const task = tasks.find((task) => task.id === item.taskId);
        return task ? { ...item, title: task.title, status: task.status, archived: Boolean(task.archivedAt), estimate: taskEstimate(task, tasks) } : item;
    });
    const totals = planTotals(items);
    const existingIds = items.map((item) => item.taskId);
    const candidates = planningCandidates(tasks, projects).filter((task) => !existingIds.includes(task.id));
    const previous = [...plans].filter((value) => value.date < date).sort((a, b) => b.date.localeCompare(a.date))[0];
    const unfinished = new Set(previous?.items.filter((item) => item.status !== 'done').map((item) => item.taskId) ?? []);
    const conflicts = overlaps([...plans.filter((value) => value.date !== date).flatMap((value) => value.items), ...items]);
    function setPlan(next: PlanItem[]) { setItems(next); setDirty(true); }
    function add(task: Task) { return { taskId: task.id, title: task.title, status: task.status, archived: false, estimate: taskEstimate(task, tasks), start: null, end: null }; }
    function move(index: number, offset: number) {
        const next = [...items]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; setPlan(next);
    }
    function schedule(index: number, startValue: string, endValue: string) {
        try {
            const entry = { ...items[index], start: startValue ? scheduledInstant(startValue, timezone) : null, end: endValue ? scheduledInstant(endValue, timezone) : null };
            setPlan(items.map((item, i) => i === index ? entry : item)); setMessage('');
        } catch { setMessage('That local time is invalid or ambiguous in this timezone. Choose another time.'); }
    }
    return <div className="space-y-4">
        <p className="text-xs text-vt-text-muted">{timezone} · {past ? 'Historical plan — later task changes do not rewrite these results.' : 'Estimates count against your budget. Scheduling is optional and does not change deadlines.'}</p>
        <label className="block text-sm text-vt-primary">Available time today (minutes)
            <input disabled={past || pending} type="number" min={0} max={1440} value={budget} onChange={(e) => { setBudget(e.target.value); setDirty(true); }} placeholder="Enter a fresh budget" className={'ml-3 w-40 ' + control} />
        </label>
        <div className="flex flex-wrap gap-4 font-mono text-sm">
            <span>{totals.estimated} min estimated{totals.unknown ? ' (partial)' : ''}</span>
            <span className={totals.unknown ? 'text-vt-primary' : ''}>{totals.unknown} unbudgeted {totals.unknown === 1 ? 'task' : 'tasks'}</span>
            <span>{totals.scheduled} min scheduled</span>
            {budget !== '' ? <span className={totals.estimated > Number(budget) ? 'text-vt-red' : 'text-vt-green'}>{Math.max(0, Number(budget) - totals.estimated)} min remaining{totals.estimated > Number(budget) ? ' · over budget by ' + (totals.estimated - Number(budget)) + ' min' : ''}</span> : <span>Budget not set</span>}
        </div>
        {conflicts.length ? <div role="status" className="rounded border border-vt-primary p-3 text-sm text-vt-primary"><p>Schedule overlaps — you may still save:</p>{conflicts.map((value, i) => <p key={i}>{value}</p>)}</div> : null}
        <ol className="space-y-3">
            {items.map((item, index) => {
                const task = tasks.find((value) => value.id === item.taskId);
                const duration = item.start && item.end ? (Date.parse(item.end) - Date.parse(item.start)) / 60000 : null;
                return <li key={item.taskId} className="rounded border border-vt-border bg-vt-background p-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-vt-primary">{index + 1}.</span>
                        <Link href={'/dashboard/tasks#task-' + item.taskId} className="min-w-0 flex-1 break-words font-bold">{item.title}</Link>
                        <span className="text-xs">{item.status === 'ready_for_review' ? 'Ready for review' : item.status.replaceAll('_', ' ')}{item.archived ? ' · archived' : ''}</span>
                        {!past ? <>
                            <button type="button" aria-label={'Move ' + item.title + ' up'} disabled={pending || index === 0} onClick={() => move(index, -1)} className="text-sm text-vt-green">↑</button>
                            <button type="button" aria-label={'Move ' + item.title + ' down'} disabled={pending || index === items.length - 1} onClick={() => move(index, 1)} className="text-sm text-vt-green">↓</button>
                            <button type="button" draggable={!pending} aria-label={'Drag ' + item.title + ' to reorder'} onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))} className="cursor-grab text-sm text-vt-green">Drag</button>
                            <span onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (!Number.isInteger(from) || from < 0 || from >= items.length) return; const next = [...items]; const [moving] = next.splice(from, 1); next.splice(index, 0, moving); setPlan(next); }} className="rounded border border-dashed border-vt-border px-2 py-1 text-xs">Drop here</span>
                            <button type="button" disabled={pending} onClick={() => setPlan(items.filter((_, i) => i !== index))} className="text-sm text-vt-red">Remove from plan</button>
                            {task && !item.archived ? <button type="button" disabled={pending || dirty} onClick={() => start(async () => { const result = await changeTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done'); setMessage(result.message); router.refresh(); })} className="text-sm text-vt-green">{task.status === 'done' ? 'Reopen task' : 'Complete task'}</button> : null}
                        </> : null}
                    </div>
                    <p className="mt-2 text-xs text-vt-text-muted">{item.estimate.minutes} min estimated{item.estimate.unknown ? ' · ' + item.estimate.unknown + ' unbudgeted' : ''}{duration !== null ? ' · ' + duration + ' min scheduled' + (duration !== item.estimate.minutes ? ' (differs from estimate)' : '') : ''}</p>
                    {task?.projectId ? <Link href={'/dashboard/projects/' + task.projectId} className="mt-1 block text-xs text-vt-green">{projects.find((value) => value.id === task.projectId)?.name ?? 'View project'}</Link> : null}
                    {!past ? <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="text-xs">Start <input disabled={pending} type="datetime-local" value={scheduledLocal(item.start, timezone)} onChange={(e) => schedule(index, e.target.value, scheduledLocal(item.end, timezone))} className={control} /></label>
                        <label className="text-xs">End <input disabled={pending} type="datetime-local" value={scheduledLocal(item.end, timezone)} onChange={(e) => schedule(index, scheduledLocal(item.start, timezone), e.target.value)} className={control} /></label>
                        <button type="button" disabled={pending} onClick={() => setPlan(items.map((value, i) => i === index ? { ...value, start: null, end: null } : value))} className="text-xs text-vt-green">Clear block</button>
                    </div> : item.start ? <p className="mt-2 text-xs">{scheduledLocal(item.start, timezone)} – {scheduledLocal(item.end, timezone)}</p> : null}
                </li>;
            })}
        </ol>
        {items.length === 0 ? <p className="text-sm text-vt-text-muted">{past ? 'No saved plan for this date in the loaded history.' : 'Choose work below to build your day.'}</p> : null}
        {!past ? <>
            <div className="flex flex-wrap items-center gap-3">
                <button type="button" disabled={pending} className="rounded bg-vt-primary px-4 py-2 font-bold text-vt-ink" onClick={() => start(async () => {
                    const result = await saveDailyPlan({ date, timezone, budgetMinutes: budget === '' ? null : Number(budget), revision: plan?.revision ?? 0, items });
                    setMessage(result.message);
                    if (result.status === 'success') { setDirty(false); onSaved?.(); router.refresh(); }
                })}>{pending ? 'Saving…' : 'Save daily plan'}</button>
                <button type="button" disabled={pending || budget === ''} className="text-sm text-vt-green" onClick={() => {
                    const proposed = suggestedTasks(tasks, projects, Math.max(0, Number(budget) - totals.estimated), existingIds);
                    setPlan([...items, ...proposed.map(add)]);
                    setMessage('Suggested order: deadlines, priority, then fit. Review the plan before saving. Oversized tasks can be split below.');
                }}>Suggest work to review</button>
                {dirty ? <span className="text-xs text-vt-primary">Unsaved changes · save before completing tasks</span> : null}
            </div>
            <details open={items.length === 0}>
                <summary className="cursor-pointer font-mono text-sm text-vt-primary">Available work · review unfinished work</summary>
                <p className="mt-2 text-xs text-vt-text-muted">Ordered by deadline, priority, then estimate. Unfinished work is offered for review, never moved automatically.</p>
                <ul className="mt-3 divide-y divide-vt-border">
                    {candidates.map((task) => <li key={task.id} className="py-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href={'/dashboard/tasks#task-' + task.id} className="min-w-0 flex-1 break-words text-sm">{task.title}{task.parentId ? ' · subtask' : ''}</Link>
                            <span className="text-xs text-vt-text-muted">{task.dueDate ?? 'No deadline'} · {task.priority} · {task.estimatedMinutes ?? 'Unbudgeted'}{task.estimatedMinutes != null ? ' min' : ''}</span>
                            {unfinished.has(task.id) ? <span className="text-xs text-vt-primary">Unfinished from {previous?.date}</span> : null}
                            <button type="button" disabled={pending} onClick={() => setPlan([...items, add(task)])} className="text-sm text-vt-green">Add to plan</button>
                            {!task.parentId ? <button type="button" onClick={() => setSplit(split === task.id ? null : task.id)} className="text-sm text-vt-primary">Split task</button> : null}
                        </div>
                        {split === task.id ? <SplitTaskForm parentId={task.id} /> : null}
                    </li>)}
                    {candidates.length === 0 ? <li className="py-3 text-sm text-vt-text-muted">No available work. Capture a task or review your project tasks.</li> : null}
                </ul>
            </details>
        </> : null}
        {message ? <p role="status" className="text-sm">{message}</p> : null}
        <Link href="/dashboard/calendar" className="block text-sm text-vt-green">Open connected calendar</Link>
    </div>;
}
