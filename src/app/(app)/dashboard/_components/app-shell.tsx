'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import type { AssistantMode } from '@/features/assistant/types';
import {
    ASSISTANT_VOICE_OPTIONS,
    DEFAULT_ASSISTANT_VOICE_ID,
} from '@/features/assistant/voices';
import { AssistantChat } from './assistant-chat';
import { SideNav } from './side-nav';
import { VoiceDock } from './voice-dock';

export function AppShell({ children }: { children: ReactNode }) {
    const [assistantMode, setAssistantMode] = useState<AssistantMode>('text');
    const [selectedVoiceId, setSelectedVoiceId] = useState(
        DEFAULT_ASSISTANT_VOICE_ID
    );

    return (
        <main className="min-h-screen bg-[#07110f] p-3 text-[#f8e8c0]">
            <div className="grid min-h-[calc(100vh-24px)] gap-3 rounded-lg border border-[#7c4c2d] bg-[#0b1512] p-3 shadow-2xl shadow-black/40 lg:grid-cols-[220px_minmax(0,1fr)_340px]">
                <SideNav />
                <section className="min-w-0 rounded-md border border-[#25392f] bg-[#101d19] p-4">
                    {children}
                </section>
                <aside className="flex min-w-0 flex-col gap-3">
                    <AssistantChat
                        mode={assistantMode}
                        onVoiceChange={setSelectedVoiceId}
                        selectedVoiceId={selectedVoiceId}
                        voiceOptions={ASSISTANT_VOICE_OPTIONS}
                    />
                    <VoiceDock
                        mode={assistantMode}
                        onModeChange={setAssistantMode}
                    />
                </aside>
            </div>
        </main>
    );
}
