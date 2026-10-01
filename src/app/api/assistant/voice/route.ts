import { NextResponse } from 'next/server';
import { fishAudio } from '@/lib/fish/server';
import { ASSISTANT_VOICE_OPTIONS } from '@/features/assistant/voices';
import { getAssistantMoodOption } from '@/features/assistant/moods';
import { getCurrentUserAssistantPreferences } from '@/features/profile/server/queries';
import { AssistantAccessError, consumeAssistantAllowance, requireAssistantAccount } from '@/features/assistant/server/access';
import { InvalidAssistantRequest, parseVoiceRequest, readAssistantBody } from '@/features/assistant/validation';

const voiceIds = new Set(ASSISTANT_VOICE_OPTIONS.map((voice) => voice.id));

export async function POST(request: Request) {
    try {
        const supabase = await requireAssistantAccount();
        const { text, voiceId } = parseVoiceRequest(await readAssistantBody(request), voiceIds);
        await consumeAssistantAllowance(supabase, 'voice');
        const { assistantMood } = await getCurrentUserAssistantPreferences();
        const mood = getAssistantMoodOption(assistantMood);
        const audio = await fishAudio.textToSpeech.convert(
            { text: `${mood.fishAudioCue} ${text}`, reference_id: voiceId, format: 'mp3' },
            's2.1-pro-free' as never,
            { timeoutInSeconds: 30, maxRetries: 0 },
        );
        return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
    } catch (error) {
        const status = error instanceof AssistantAccessError ? error.status : error instanceof InvalidAssistantRequest ? 400 : 500;
        if (status === 500) console.error('Assistant voice failed.', error);
        return NextResponse.json({ message: status === 500 ? 'Unable to create voice response.' : (error as Error).message }, { status });
    }
}
