import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';
import { loadTasksForPage } from '@/features/tasks/server/queries';
import { TaskLoadNotice } from '@/features/tasks/components/task-load-notice';
import { listProjects } from '@/features/projects/server/queries';
import { loadFocusSessions } from '@/features/focus/server/queries';

export default async function DashboardPage() {
    const result = await loadTasksForPage();
    if (result.status === 'unavailable') return <TaskLoadNotice setupRequired={result.setupRequired} />;
    const [projects, focus] = await Promise.all([listProjects(), loadFocusSessions()]);
    return <DashboardOverview tasks={result.tasks} projects={projects} focus={focus} />;
}
