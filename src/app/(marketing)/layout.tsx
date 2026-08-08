import type { ReactNode } from 'react';

import { CurrentUserProvider } from '@/features/profile/components/current-user-provider';
import { getCurrentUserProfile } from '@/features/profile/server/queries';

export default async function MarketingLayout({
    children,
}: {
    children: ReactNode;
}) {
    const currentUser = await getCurrentUserProfile();

    return (
        <CurrentUserProvider currentUser={currentUser}>
            {children}
        </CurrentUserProvider>
    );
}
