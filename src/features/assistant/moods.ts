export const ASSISTANT_MOOD_OPTIONS = [
    {
        id: 'balanced',
        name: 'Balanced',
        openAiInstructions:
            'Use a friendly, natural, and pragmatic delivery. Adapt your energy to the user while staying productive.',
        fishAudioCue: '[warm and conversational]',
    },
    {
        id: 'calm',
        name: 'Calm',
        openAiInstructions:
            'Use a steady, reassuring, and unhurried delivery. Reduce pressure and make the next step feel manageable.',
        fishAudioCue: '[calm, soft voice, and speaking slowly]',
    },
    {
        id: 'encouraging',
        name: 'Encouraging',
        openAiInstructions:
            'Be warm, optimistic, and supportive. Recognize progress without using empty praise or losing practical focus.',
        fishAudioCue: '[warm and encouraging]',
    },
    {
        id: 'focused',
        name: 'Focused',
        openAiInstructions:
            'Be crisp, organized, and task-oriented. Prioritize clarity, decisions, and concrete next actions over conversation.',
        fishAudioCue: '[calm, low, and commanding]',
    },
    {
        id: 'playful',
        name: 'Playful',
        openAiInstructions:
            'Use light, personable humor when it fits, but keep the user moving toward useful work. Never be distracting or flippant about serious topics.',
        fishAudioCue: '[curious and lightly amused]',
    },
    {
        id: 'direct',
        name: 'Direct',
        openAiInstructions:
            'Be candid, concise, and decisive. State the recommended action clearly while remaining respectful and constructive.',
        fishAudioCue: '[confident and concise]',
    },
    {
        id: 'angry',
        name: 'Angry',
        openAiInstructions:
            'Use controlled, forceful urgency. Be firm about priorities and blockers without insulting, threatening, or personally attacking the user.',
        fishAudioCue: '[angry but controlled, low and commanding]',
    },
    {
        id: 'excited',
        name: 'Excited',
        openAiInstructions:
            'Use energetic, optimistic momentum. Celebrate meaningful progress, but keep recommendations specific and do not overstate importance.',
        fishAudioCue: '[excited, quick and energetic]',
    },
] as const;

export type AssistantMood = (typeof ASSISTANT_MOOD_OPTIONS)[number]['id'];
export type AssistantMoodOption = (typeof ASSISTANT_MOOD_OPTIONS)[number];

export function isAssistantMood(value: string | null | undefined): value is AssistantMood {
    return ASSISTANT_MOOD_OPTIONS.some((mood) => mood.id === value);
}

export function getAssistantMoodOption(
    value: string | null | undefined
): AssistantMoodOption {
    return (
        ASSISTANT_MOOD_OPTIONS.find((mood) => mood.id === value) ??
        ASSISTANT_MOOD_OPTIONS[0]
    );
}
