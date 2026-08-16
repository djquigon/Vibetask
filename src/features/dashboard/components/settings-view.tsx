import { ASSISTANT_VOICE_OPTIONS } from '@/features/assistant/voices';
import { ActiveVoicesForm } from '@/features/profile/components/active-voices-form';
import { AssistantMoodForm } from '@/features/profile/components/assistant-mood-form';
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
        <div className="mx-auto w-full">
            <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-5 border-b border-vt-border bg-vt-surface-raised px-4 pt-4 pb-4">
                <h1 className="font-mono text-2xl font-black uppercase text-vt-primary">
                    Settings
                </h1>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
                <section className="rounded-md border border-vt-border bg-vt-surface p-5">
                    <h2 className="mb-5 font-mono text-lg font-black uppercase text-vt-text">
                        Profile details
                    </h2>
                    <ProfileDetailsForm profile={profile} />
                </section>

                <div aria-label="Assistant preferences" className="grid content-start gap-5">
                    <section className="rounded-md border border-vt-border bg-vt-surface p-5">
                        <h2 className="mb-5 font-mono text-lg font-black uppercase text-vt-text">
                            Assistant mood
                        </h2>
                        <AssistantMoodForm assistantMood={profile.assistantMood} />
                    </section>

                    <section className="rounded-md border border-vt-border bg-vt-surface p-5">
                        <h2 className="mb-5 font-mono text-lg font-black uppercase text-vt-text">
                            Active voices
                        </h2>
                        <ActiveVoicesForm
                            activeVoiceIds={profile.activeVoiceIds}
                            voiceOptions={ASSISTANT_VOICE_OPTIONS.map(
                                ({ id, name }) => ({
                                    id,
                                    name,
                                })
                            )}
                        />
                    </section>
                </div>

                <section className="rounded-md border border-vt-border bg-vt-surface p-5 xl:col-span-2">
                    <h2 className="mb-5 font-mono text-lg font-black uppercase text-vt-text">
                        Color theme
                    </h2>
                    <ThemePicker initialTheme={theme} />
                </section>
            </div>
        </div>
    );
}
