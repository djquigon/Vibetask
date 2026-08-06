import { NextResponse } from 'next/server';

import { createAssistantChatResponse } from '@/features/assistant/server/chat';
import type {
    AssistantChatError,
    AssistantChatRequest,
} from '@/features/assistant/types';

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Partial<AssistantChatRequest>;
        const message = body.message?.trim();

        if (!message) {
            const error: AssistantChatError = {
                message: 'Message is required.',
            };

            return NextResponse.json(error, { status: 400 });
        }

        const response = await createAssistantChatResponse(message);

        return NextResponse.json(response);
    } catch {
        const error: AssistantChatError = {
            message: 'Unable to create assistant response.',
        };

        return NextResponse.json(error, { status: 500 });
    }
}
