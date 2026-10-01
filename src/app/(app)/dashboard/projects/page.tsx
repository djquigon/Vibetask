import { ProjectsView } from '@/features/projects/components/projects-view';
import { listProjects } from '@/features/projects/server/queries';
import { listTasks } from '@/features/tasks/server/queries';

export default async function ProjectsPage() {
    const [projects, tasks] = await Promise.all([listProjects(), listTasks()]);
    return <ProjectsView projects={projects} tasks={tasks} />;
}
