import type { ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { CurrentUserProvider } from '@/features/profile/components/current-user-provider';
import { recordCurrentUserDailyLoginStreak } from '@/features/profile/server/mutations';
import { getCurrentUserProfile } from '@/features/profile/server/queries';

export default async function AuthenticatedAppLayout({
    children,
}: {
    children: ReactNode;
}) {
    await recordCurrentUserDailyLoginStreak();
    const currentUser = await getCurrentUserProfile();

    if (!currentUser) {
        redirect('/login');
    }

    return (
        <CurrentUserProvider currentUser={currentUser}>
            {children}
        </CurrentUserProvider>
    );
}
