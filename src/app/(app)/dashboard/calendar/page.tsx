'use client';

import { CalendarView } from '@/features/calendar/components/calendar-view';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import listPlugin from '@fullcalendar/react/list';
import multiMonthPlugin from '@fullcalendar/react/multimonth';

export default function CalendarPage() {
    return (
        <CalendarView
            plugins={[
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                multiMonthPlugin,
            ]}
            addButton={{
                text: 'Add Event',
                click() {
                    alert('handle add event...');
                },
            }}
            availableViews={[
                'dayGridMonth',
                'timeGridWeek',
                'timeGridDay',
                'listWeek',
                'multiMonthYear',
            ]}
            initialView="dayGridMonth"
        />
    );
}
