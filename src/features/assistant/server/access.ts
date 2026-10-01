import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export class AssistantAccessError extends Error {
    readonly status: number;
    constructor(message: string, status: number) { super(message); this.status = status; }
}

export async function requireAssistantAccount() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new AssistantAccessError('Please sign in to use the assistant.', 401);
    return supabase;
}

export async function consumeAssistantAllowance(
    supabase: Awaited<ReturnType<typeof requireAssistantAccount>>,
    channel: 'chat' | 'voice',
) {
    const { data, error } = await supabase.rpc('consume_assistant_allowance', { requested_channel: channel });
    if (error) {
        console.error('Unable to check assistant allowance.', error);
        throw new AssistantAccessError('The assistant is temporarily unavailable.', 503);
    }
    if (data !== true) throw new AssistantAccessError('Assistant request limit reached. Try again later.', 429);
}
