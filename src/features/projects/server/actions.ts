'use server';
import { revalidatePath } from 'next/cache';
import { parseProjectDraft } from '../validation';
import { saveProject, editProject, setProjectStatus } from './mutations';
import type { ProjectActionState } from '../types';

function draft(data: FormData) {
    return parseProjectDraft({
        name: data.get('name'), description: data.get('description') ?? '',
        startDate: data.get('startDate') || null, dueDate: data.get('dueDate') || null,
    });
}
export async function createProject(_previous: ProjectActionState, data: FormData): Promise<ProjectActionState> {
    try {
        await saveProject(String(data.get('id')), draft(data));
        revalidatePath('/dashboard', 'layout');
        return { status: 'success', message: 'Project saved.' };
    } catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to save project.' }; }
}
export async function updateProject(_previous: ProjectActionState, data: FormData): Promise<ProjectActionState> {
    try {
        await editProject(String(data.get('id')), draft(data));
        revalidatePath('/dashboard', 'layout');
        return { status: 'success', message: 'Project updated.' };
    } catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to update project.' }; }
}
export async function changeProjectStatus(id: string, status: string): Promise<ProjectActionState> {
    try {
        await setProjectStatus(id, status);
        revalidatePath('/dashboard', 'layout');
        return { status: 'success', message: status === 'archived' ? 'Project archived. Its tasks are preserved.' : 'Project restored.' };
    } catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to update project.' }; }
}
