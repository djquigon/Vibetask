import { TasksView } from '@/features/tasks/components/tasks-view';
import { loadTasksForPage } from '@/features/tasks/server/queries';
import { TaskLoadNotice } from '@/features/tasks/components/task-load-notice';
import { listProjects } from '@/features/projects/server/queries';

export default async function TasksPage() {
    const result = await loadTasksForPage();
    if (result.status === 'unavailable') return <TaskLoadNotice setupRequired={result.setupRequired} />;
    return <TasksView tasks={result.tasks} projects={await listProjects()} />;
}
