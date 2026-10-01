import { NextResponse } from 'next/server';
import { createAssistantChatResponse } from '@/features/assistant/server/chat';
import { AssistantAccessError, consumeAssistantAllowance, requireAssistantAccount } from '@/features/assistant/server/access';
import { InvalidAssistantRequest, parseChatRequest, readAssistantBody } from '@/features/assistant/validation';

export async function POST(request: Request) {
    try {
        const supabase = await requireAssistantAccount();
        const { message, history } = parseChatRequest(await readAssistantBody(request));
        await consumeAssistantAllowance(supabase, 'chat');
        return NextResponse.json(await createAssistantChatResponse(message, history), { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        const status = error instanceof AssistantAccessError ? error.status : error instanceof InvalidAssistantRequest ? 400 : 500;
        if (status === 500) console.error('Assistant chat failed.', error);
        return NextResponse.json({ message: status === 500 ? 'Unable to create assistant response.' : (error as Error).message }, { status });
    }
}
