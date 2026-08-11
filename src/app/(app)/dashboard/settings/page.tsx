import { redirect } from 'next/navigation';

import { SettingsView } from '@/features/dashboard/components/settings-view';
import { getCurrentUserProfileDetails } from '@/features/profile/server/queries';
import { getTheme } from '@/features/theme/server/queries';

export default async function SettingsPage() {
    const [profile, theme] = await Promise.all([
        getCurrentUserProfileDetails(),
        getTheme(),
    ]);

    if (!profile) {
        redirect('/login');
    }

    return <SettingsView profile={profile} theme={theme} />;
}
