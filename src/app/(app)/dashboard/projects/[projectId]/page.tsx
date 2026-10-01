import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/features/projects/components/project-detail';
import { listProjects } from '@/features/projects/server/queries';
import { listTasks } from '@/features/tasks/server/queries';

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const [projects, tasks] = await Promise.all([listProjects(), listTasks()]);
    const project = projects.find((item) => item.id === projectId);
    if (!project) notFound();
    return <ProjectDetail project={project} projects={projects} tasks={tasks} />;
}
