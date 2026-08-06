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

export function AppShell({ children }: { children: ReactNode }) {
    const [assistantMode, setAssistantMode] = useState<AssistantMode>('text');
    const [selectedVoiceId, setSelectedVoiceId] = useState(
        DEFAULT_ASSISTANT_VOICE_ID
    );

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
                        voiceOptions={ASSISTANT_VOICE_OPTIONS}
                    />
                </aside>
            </div>
        </main>
    );
}
