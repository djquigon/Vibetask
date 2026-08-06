import 'server-only';

import { openai } from '@/lib/openai/server';
import { serverEnv } from '@/lib/env/server';
import type { AssistantChatResponse } from '../types';

const VIBETASK_ASSISTANT_INSTRUCTIONS = `
You are the Vibetask AI assistant.

Vibetask is a productivity app for tasks, calendar planning, projects, notes,
analytics, focus sessions, and habits. It is gamified with users being able to
earn streaks and XP tied to their account productivity.

Help the user think clearly and turn vague intent into practical next steps.
You may suggest actions like creating tasks, calendar blocks, notes, or reports,
but do not claim that you have changed app data yet.

Keep responses concise, practical, and focused on productivity. Try to keep all 
responses under 75 words unless you deem it absolutely necessary to provide more detail. 
Do not use emojis, asterisks, or other markdown formatting.
`;

export async function createAssistantChatResponse(
    message: string
): Promise<AssistantChatResponse> {
    const response = await openai.responses.create({
        model: serverEnv.openAiModel,
        instructions: VIBETASK_ASSISTANT_INSTRUCTIONS,
        input: message,
    });

    if (response.output_text.length === 0) {
        throw new Error('Assistant response is empty.');
    }

    return {
        message: 'Assistant response created.',
        assistantMessage: response.output_text,
        actions: [],
    };
}
