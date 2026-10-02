import { FocusView } from '@/features/focus/components/focus-view';
import { FocusLoadNotice } from '@/features/focus/components/focus-load-notice';
import { loadFocusSessions } from '@/features/focus/server/queries';
import { loadTasksForPage } from '@/features/tasks/server/queries';
import { TaskLoadNotice } from '@/features/tasks/components/task-load-notice';

export default async function FocusPage({ searchParams }: { searchParams: Promise<{ task?: string }> }) {
    const [focus, tasks, params] = await Promise.all([loadFocusSessions(), loadTasksForPage(), searchParams]);
    if (focus.status === 'unavailable') return <FocusLoadNotice setupRequired={focus.setupRequired} />;
    if (tasks.status === 'unavailable') return <TaskLoadNotice setupRequired={tasks.setupRequired} />;
    return <FocusView sessions={focus.sessions} tasks={tasks.tasks} initialTaskId={params.task} />;
}
