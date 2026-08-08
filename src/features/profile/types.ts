export type CurrentUserProfile = {
    id: string;
    email: string | null;
    displayName: string | null;
    dailyLoginStreakCount: number;
    createdAt: string;
    updatedAt: string;
};
