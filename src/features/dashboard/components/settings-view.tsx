import { ProfileDetailsForm } from '@/features/profile/components/profile-details-form';
import type { ProfileDetails } from '@/features/profile/types';

type SettingsViewProps = {
    profile: ProfileDetails;
};

export function SettingsView({ profile }: SettingsViewProps) {
    return (
        <div className="mx-auto w-full max-w-3xl">
            <div className="border-b border-[#25392f] pb-4">
                <h1 className="font-mono text-2xl font-black uppercase text-[#ffb14f]">
                    Settings
                </h1>
            </div>

            <section className="mt-5 rounded-md border border-[#25392f] bg-[#0d1b17] p-5">
                <h2 className="mb-5 font-mono text-lg font-black uppercase text-[#f8e8c0]">
                    Profile details
                </h2>
                <ProfileDetailsForm profile={profile} />
            </section>
        </div>
    );
}
