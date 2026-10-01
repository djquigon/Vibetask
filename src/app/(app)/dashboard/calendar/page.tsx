import { listProjects } from '@/features/projects/server/queries';
import { listTasks } from '@/features/tasks/server/queries';
import { ConnectedCalendar } from '@/features/calendar/components/connected-calendar';

export default async function CalendarPage() {
    const [projects, tasks] = await Promise.all([listProjects(), listTasks()]);
    return <ConnectedCalendar projects={projects} tasks={tasks} />;
}
