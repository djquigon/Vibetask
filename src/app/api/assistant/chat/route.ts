import { NextResponse } from 'next/server';

import { createAssistantChatResponse } from '@/features/assistant/server/chat';
import type {
    AssistantChatError,
    AssistantChatRequest,
} from '@/features/assistant/types';

export async function POST(request: Request) {
    const MAX_MESSAGE_LENGTH = 4000;

    let body: Partial<AssistantChatRequest>;

    try {
        body = (await request.json()) as Partial<AssistantChatRequest>;
    } catch {
        return NextResponse.json(
            { message: 'Request body must be valid JSON.' },
            { status: 400 }
        );
    }

    const message = body.message?.trim();

    if (!message) {
        return NextResponse.json(
            { message: 'Message is required.' },
            { status: 400 }
        );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json(
            { message: 'Message must be 4000 characters or fewer.' },
            { status: 400 }
        );
    }

    try {
        const response = await createAssistantChatResponse(message);

        return NextResponse.json(response);
    } catch {
        const error: AssistantChatError = {
            message: 'Unable to create assistant response.',
        };

        return NextResponse.json(error, { status: 500 });
    }
}
