export type AssistantMode = 'text' | 'voice';

export type AssistantActionType =
    | 'create_task'
    | 'create_calendar_event'
    | 'create_note'
    | 'generate_report';

export type AssistantAction = {
    type: AssistantActionType;
    summary: string;
    requiresConfirmation: boolean;
};

export type AssistantChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export type AssistantChatRequest = {
    message: string;
    history?: AssistantChatMessage[];
};

export type AssistantChatResponse = {
    message: string;
    assistantMessage: string;
    actions: [];
};

export type AssistantChatError = {
    message: string;
};

export type AssistantVoiceRequest = {
    text: string;
    voiceId: string;
};

export type AssistantVoiceResponse = {
    audioUrl: string;
};

export type AssistantVoiceError = {
    message: string;
};
