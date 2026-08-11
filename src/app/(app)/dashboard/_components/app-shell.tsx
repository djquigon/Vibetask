'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { AssistantMode } from '@/features/assistant/types';
import {
    ASSISTANT_VOICE_OPTIONS,
    DEFAULT_ASSISTANT_VOICE_ID,
} from '@/features/assistant/voices';
import { useCurrentUser } from '@/features/profile/hooks/use-current-user';
import { AssistantChat } from './assistant-chat';
import { SideNav } from './side-nav';

export function AppShell({ children }: { children: ReactNode }) {
    const currentUser = useCurrentUser();
    const [assistantMode, setAssistantMode] = useState<AssistantMode>('voice');
    const activeVoiceOptions = useMemo(() => {
        const activeVoiceIds = currentUser?.activeVoiceIds;

        if (!activeVoiceIds?.length) {
            return ASSISTANT_VOICE_OPTIONS;
        }

        const activeVoiceIdSet = new Set(activeVoiceIds);
        const options = ASSISTANT_VOICE_OPTIONS.filter((voice) =>
            activeVoiceIdSet.has(voice.id)
        );

        return options.length > 0 ? options : ASSISTANT_VOICE_OPTIONS;
    }, [currentUser?.activeVoiceIds]);
    const [selectedVoiceId, setSelectedVoiceId] = useState(
        DEFAULT_ASSISTANT_VOICE_ID
    );

    useEffect(() => {
        if (!activeVoiceOptions.some((voice) => voice.id === selectedVoiceId)) {
            const voiceUpdateTimer = window.setTimeout(() => {
                setSelectedVoiceId(activeVoiceOptions[0].id);
            }, 0);

            return () => window.clearTimeout(voiceUpdateTimer);
        }
    }, [activeVoiceOptions, selectedVoiceId]);

    return (
        <main className="h-screen overflow-hidden bg-[#07110f] p-3 text-[#f8e8c0]">
            <div className="grid h-full min-h-0 gap-3 rounded-lg border border-[#7c4c2d] bg-[#0b1512] p-3 shadow-2xl shadow-black/40 lg:grid-cols-[220px_minmax(0,1fr)_340px]">
                <SideNav />
                <section className="min-h-0 min-w-0 overflow-auto rounded-md border border-[#25392f] bg-[#101d19] p-4">
                    {children}
                </section>
                <aside className="flex min-h-0 min-w-0 flex-col gap-3">
                    <AssistantChat
                        mode={assistantMode}
                        onModeChange={setAssistantMode}
                        onVoiceChange={setSelectedVoiceId}
                        selectedVoiceId={selectedVoiceId}
                        voiceOptions={activeVoiceOptions}
                    />
                </aside>
            </div>
        </main>
    );
}
