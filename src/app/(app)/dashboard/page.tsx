import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';
import { loadTasksForPage } from '@/features/tasks/server/queries';
import { TaskLoadNotice } from '@/features/tasks/components/task-load-notice';
import { listProjects } from '@/features/projects/server/queries';
import { loadPlanningData } from '@/features/planning/server/queries';
import { DailyPlanner } from '@/features/planning/components/daily-planner';
import { loadFocusSessions } from '@/features/focus/server/queries';

export default async function DashboardPage() {
    const result = await loadTasksForPage();
    if (result.status === 'unavailable') return <TaskLoadNotice setupRequired={result.setupRequired} />;
    const [projects, planning, focus] = await Promise.all([listProjects(), loadPlanningData(), loadFocusSessions()]);
    return <div className="space-y-4"><DailyPlanner data={planning} tasks={result.tasks} projects={projects} /><DashboardOverview tasks={result.tasks} projects={projects} focus={focus} /></div>;
}
