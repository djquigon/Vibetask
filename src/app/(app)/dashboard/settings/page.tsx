import { redirect } from 'next/navigation';

import { SettingsView } from '@/features/dashboard/components/settings-view';
import { getCurrentUserProfileDetails } from '@/features/profile/server/queries';

export default async function SettingsPage() {
    const profile = await getCurrentUserProfileDetails();

    if (!profile) {
        redirect('/login');
    }

    return <SettingsView profile={profile} />;
}
