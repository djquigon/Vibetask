import { NextResponse } from 'next/server';

import { fishAudio } from '@/lib/fish/server';

import type {
    AssistantVoiceError,
    AssistantVoiceRequest,
} from '@/features/assistant/types';

export async function POST(request: Request) {
    let body: Partial<AssistantVoiceRequest>;

    try {
        body = (await request.json()) as Partial<AssistantVoiceRequest>;
    } catch {
        const error: AssistantVoiceError = {
            message: 'Request body must be valid JSON.',
        };

        return NextResponse.json(error, { status: 400 });
    }

    const text = body.text?.trim();
    const voiceId = body.voiceId?.trim();

    if (!text) {
        return NextResponse.json(
            { message: 'Text is required.' },
            { status: 400 }
        );
    }

    if (!voiceId) {
        return NextResponse.json(
            { message: 'Voice ID is required.' },
            { status: 400 }
        );
    }

    try {
        const audio = await fishAudio.textToSpeech.convert(
            {
                text,
                reference_id: voiceId,
                format: 'mp3',
            },
            's2.1-pro-free' as never /* I had to include 'as never' to satisfy the type checker, for some reason the sdk thinks you can't use s2.1-pro-free */
        );

        return new Response(audio, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error(error);
        const errorResponse: AssistantVoiceError = {
            message: 'Unable to create voice response.',
        };

        return NextResponse.json(errorResponse, { status: 500 });
    }
}
