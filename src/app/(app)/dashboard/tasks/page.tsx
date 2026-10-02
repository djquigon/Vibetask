import { TasksView } from '@/features/tasks/components/tasks-view';
import { loadTasksForPage } from '@/features/tasks/server/queries';
import { TaskLoadNotice } from '@/features/tasks/components/task-load-notice';
import { listProjects } from '@/features/projects/server/queries';
import { loadFocusSessions } from '@/features/focus/server/queries';

export default async function TasksPage() {
    const result = await loadTasksForPage();
    if (result.status === 'unavailable') return <TaskLoadNotice setupRequired={result.setupRequired} />;
    const [projects, focus] = await Promise.all([listProjects(), loadFocusSessions()]);
    return <TasksView tasks={result.tasks} projects={projects} focus={focus} />;
}
