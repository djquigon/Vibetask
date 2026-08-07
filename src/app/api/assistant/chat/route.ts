import { NextResponse } from 'next/server';

import { createAssistantChatResponse } from '@/features/assistant/server/chat';
import type {
    AssistantChatError,
    AssistantChatMessage,
    AssistantChatRequest,
} from '@/features/assistant/types';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_MESSAGE_LENGTH = 4000;

export async function POST(request: Request) {
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

    const historyResult = parseAssistantHistory(body.history);

    if (!historyResult.ok) {
        return NextResponse.json(
            { message: historyResult.message },
            { status: 400 }
        );
    }

    try {
        const response = await createAssistantChatResponse(
            message,
            historyResult.history
        );

        return NextResponse.json(response);
    } catch {
        const error: AssistantChatError = {
            message: 'Unable to create assistant response.',
        };

        return NextResponse.json(error, { status: 500 });
    }
}

function parseAssistantHistory(
    history: unknown
):
    | { ok: true; history: AssistantChatMessage[] }
    | { ok: false; message: string } {
    if (history === undefined) {
        return {
            ok: true,
            history: [],
        };
    }

    if (!Array.isArray(history)) {
        return {
            ok: false,
            message: 'History must be an array of chat messages.',
        };
    }

    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
    const parsedHistory: AssistantChatMessage[] = [];

    for (const historyMessage of recentHistory) {
        if (!isObjectRecord(historyMessage)) {
            return {
                ok: false,
                message: 'History messages must be objects.',
            };
        }

        if (
            historyMessage.role !== 'user' &&
            historyMessage.role !== 'assistant'
        ) {
            return {
                ok: false,
                message: 'History message roles must be user or assistant.',
            };
        }

        if (typeof historyMessage.content !== 'string') {
            return {
                ok: false,
                message: 'History message content must be text.',
            };
        }

        const content = historyMessage.content.trim();

        if (!content) {
            continue;
        }

        if (content.length > MAX_HISTORY_MESSAGE_LENGTH) {
            return {
                ok: false,
                message: 'History messages must be 4000 characters or fewer.',
            };
        }

        parsedHistory.push({
            role: historyMessage.role,
            content,
        });
    }

    return {
        ok: true,
        history: parsedHistory,
    };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
