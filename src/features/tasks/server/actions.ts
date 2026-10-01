'use server';
import { revalidatePath } from 'next/cache';
import { editTask, removeTask, saveTask, setTaskStatus, setTaskProject } from './mutations';
import type { TaskActionState } from '../types';

function draft(data: FormData) {
    return { title: data.get('title'), description: data.get('description') ?? '', priority: data.get('priority'), dueDate: data.get('dueDate') || null, projectId: data.get('projectId') || null };
}
function refresh() { revalidatePath('/dashboard', 'layout'); }

export async function createTask(_previous: TaskActionState, data: FormData): Promise<TaskActionState> {
    try {
        const { parseTaskDraft } = await import('../validation');
        await saveTask(String(data.get('id')), parseTaskDraft(draft(data)));
        refresh();
        return { status: 'success', message: 'Task saved.' };
    } catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to save task.' }; }
}

export async function updateTask(_previous: TaskActionState, data: FormData): Promise<TaskActionState> {
    try {
        const { parseTaskDraft } = await import('../validation');
        await editTask(String(data.get('id')), parseTaskDraft(draft(data)));
        refresh();
        return { status: 'success', message: 'Task updated.' };
    } catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to update task.' }; }
}

export async function changeTaskStatus(id: string, status: string): Promise<TaskActionState> {
    try { await setTaskStatus(id, status); refresh(); return { status: 'success', message: 'Task updated.' }; }
    catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to update task.' }; }
}

export async function deleteTask(id: string): Promise<TaskActionState> {
    try { await removeTask(id); refresh(); return { status: 'success', message: 'Task deleted.' }; }
    catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to delete task.' }; }
}

export async function linkTaskToProject(id: string, projectId: string | null): Promise<TaskActionState> {
    try { await setTaskProject(id, projectId); refresh(); return { status: 'success', message: 'Task linked to project.' }; }
    catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Unable to link task.' }; }
}
