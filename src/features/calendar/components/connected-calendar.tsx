'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import listPlugin from '@fullcalendar/react/list';
import multiMonthPlugin from '@fullcalendar/react/multimonth';
import type { Project } from '@/features/projects/types';
import type { Task } from '@/features/tasks/types';
import { connectedCalendarEvents } from '../events';
import { CalendarView } from './calendar-view';
import type { DailyPlan } from '@/features/planning/types';

export function ConnectedCalendar({ projects, tasks, plans = [] }: { projects: Project[]; tasks: Task[]; plans?: DailyPlan[] }) {
    const router = useRouter();
    const [showCompleted, setShowCompleted] = useState(false);
    return <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-mono text-2xl font-black uppercase text-vt-primary">Calendar</h1>
            <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/dashboard/projects" className="text-vt-primary">Plan a project</Link>
                <Link href="/dashboard/tasks" className="text-vt-green">Set a task deadline</Link>
            </div>
        </div>
        <p className="text-sm text-vt-text-muted">Amber shows project timelines. Green shows deadlines. Blue shows planned work blocks. Times use your device timezone. Open an entry to edit its source.</p>
        <label className="block text-sm"><input type="checkbox" checked={showCompleted} onChange={(event) => setShowCompleted(event.target.checked)} className="mr-2" />Show completed task deadlines</label>
        <CalendarView
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin]}
            availableViews={['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek', 'multiMonthYear']}
            initialView="dayGridMonth"
            events={connectedCalendarEvents(projects, tasks, showCompleted, plans)}
            editable={false}
            eventClick={(info) => { info.jsEvent.preventDefault(); router.push(info.event.url); }}
        />
    </div>;
}
