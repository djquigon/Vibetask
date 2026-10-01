export type AssistantMode = 'text' | 'voice';

export type AssistantActionType =
    | 'create_task'
    | 'create_project'
    | 'create_calendar_event'
    | 'create_note'
    | 'generate_report';

type AssistantActionBase = {
    id: string;
    summary: string;
    requiresConfirmation: true;
};
export type AssistantAction = AssistantActionBase & (
    | { type: 'create_task'; draft: import('@/features/tasks/types').TaskDraft; projects?: import('@/features/projects/types').ProjectOption[] }
    | { type: 'create_project'; draft: import('@/features/projects/types').ProjectDraft }
);

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
    actions: AssistantAction[];
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
