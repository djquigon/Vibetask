import type { AssistantMood } from '@/features/assistant/moods';

export type CurrentUserProfile = {
    id: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    activeVoiceIds: string[] | null;
    assistantMood: AssistantMood;
    dailyLoginStreakCount: number;
    createdAt: string;
    updatedAt: string;
};

export type ProfileDetails = {
    displayName: string | null;
    email: string | null;
    avatarUrl: string | null;
    hasAvatar: boolean;
    assistantContext: string | null;
    activeVoiceIds: string[] | null;
    assistantMood: AssistantMood;
};

export type ProfileDetailsActionState = {
    message: string;
    status: 'error' | 'idle' | 'success';
};

export type ActiveVoicesActionState = {
    message: string;
    status: 'error' | 'idle' | 'success';
};

export type AssistantMoodActionState = {
    message: string;
    status: 'error' | 'idle' | 'success';
};
