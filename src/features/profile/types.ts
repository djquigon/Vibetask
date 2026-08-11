export type CurrentUserProfile = {
    id: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    activeVoiceIds: string[] | null;
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
};

export type ProfileDetailsActionState = {
    message: string;
    status: 'error' | 'idle' | 'success';
};

export type ActiveVoicesActionState = {
    message: string;
    status: 'error' | 'idle' | 'success';
};
