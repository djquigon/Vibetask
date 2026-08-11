import { ASSISTANT_VOICE_OPTIONS } from '@/features/assistant/voices';
import { ActiveVoicesForm } from '@/features/profile/components/active-voices-form';
import { ProfileDetailsForm } from '@/features/profile/components/profile-details-form';
import type { ProfileDetails } from '@/features/profile/types';
import { ThemePicker } from '@/features/theme/components/theme-picker';
import type { Theme } from '@/features/theme/types';

type SettingsViewProps = {
    profile: ProfileDetails;
    theme: Theme;
};

export function SettingsView({ profile, theme }: SettingsViewProps) {
    return (
        <div className="mx-auto w-full max-w-3xl">
            <div className="border-b border-vt-border pb-4">
                <h1 className="font-mono text-2xl font-black uppercase text-vt-gold">
                    Settings
                </h1>
            </div>

            <section className="mt-5 rounded-md border border-vt-border bg-vt-surface p-5">
                <h2 className="mb-5 font-mono text-lg font-black uppercase text-vt-text">
                    Profile details
                </h2>
                <ProfileDetailsForm profile={profile} />
            </section>

            <section className="mt-5 rounded-md border border-vt-border bg-vt-surface p-5">
                <h2 className="mb-5 font-mono text-lg font-black uppercase text-vt-text">
                    Active voices
                </h2>
                <ActiveVoicesForm
                    activeVoiceIds={profile.activeVoiceIds}
                    voiceOptions={ASSISTANT_VOICE_OPTIONS.map(({ id, name }) => ({
                        id,
                        name,
                    }))}
                />
            </section>

            <section className="mt-5 rounded-md border border-vt-border bg-vt-surface p-5">
                <h2 className="mb-5 font-mono text-lg font-black uppercase text-vt-text">
                    Color theme
                </h2>
                <ThemePicker initialTheme={theme} />
            </section>
        </div>
    );
}
