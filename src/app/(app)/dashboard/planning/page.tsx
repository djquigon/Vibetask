import { DailyPlanner } from '@/features/planning/components/daily-planner';
import { loadPlanningData } from '@/features/planning/server/queries';
import { listTasks } from '@/features/tasks/server/queries';
import { listProjects } from '@/features/projects/server/queries';
export default async function PlanningPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const { date } = await searchParams;
    const [data, tasks, projects] = await Promise.all([loadPlanningData(), listTasks(), listProjects()]);
    return <DailyPlanner data={data} tasks={tasks} projects={projects} initialDate={date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined} />;
}
