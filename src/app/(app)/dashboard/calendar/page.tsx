import { listProjects } from '@/features/projects/server/queries';
import { listTasks } from '@/features/tasks/server/queries';
import { ConnectedCalendar } from '@/features/calendar/components/connected-calendar';
import { loadPlanningData } from '@/features/planning/server/queries';

export default async function CalendarPage() {
    const [projects, tasks, planning] = await Promise.all([listProjects(), listTasks(), loadPlanningData()]);
    return <ConnectedCalendar projects={projects} tasks={tasks} plans={planning.plans} />;
}
