import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Project } from '../types';

export async function listProjects(): Promise<Project[]> {
    const supabase = await createServerSupabaseClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error('Please sign in to view projects.');
    const { data, error } = await supabase.from('projects')
        .select('id, user_id, name, description, status, start_date, due_date, created_at, updated_at')
        .eq('user_id', auth.user.id).order('created_at', { ascending: false });
    if (error) {
        console.error('Project query failed.', { code: error.code, message: error.message });
        throw new Error('Unable to load your projects. Please try again.');
    }
    return (data ?? []).map((row) => ({
        id: row.id, userId: row.user_id, name: row.name, description: row.description,
        status: row.status, startDate: row.start_date, dueDate: row.due_date,
        createdAt: row.created_at, updatedAt: row.updated_at,
    }));
}
