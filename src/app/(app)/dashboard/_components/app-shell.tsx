'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import type { AssistantMode } from '@/features/assistant/types';
import { AssistantChat } from './assistant-chat';
import { SideNav } from './side-nav';
import { VoiceDock } from './voice-dock';

const VOICE_OPTIONS = [
    {
        id: '271b3db7aa744ec4b311e00b288715ca',
        name: 'Space Marine',
    },
    {
        id: '90e65eaaf50e4470b8e6d43ee6afd7d5',
        name: 'Arena Announcer',
    },
    {
        id: 'fa049bec789c4968864a85e53dd68364',
        name: 'Warren Buffett',
    },
    {
        id: 'fad5a5a6770e47019f566b8f8c0ff609',
        name: 'The Joker',
    },
    {
        id: '3ad4d432023c47ee9e6c7805b973630a',
        name: 'Morgan Freeman',
    },
    {
        id: '0429f2b252464b88b2ab2128f084290c',
        name: 'Rohit Sharma',
    },
    {
        id: '2d68791e46f34687bd1231e2086ee925',
        name: 'Elon Musk',
    },
    {
        id: '2947ec32c7e1479c8ec5628a1fc035f1',
        name: 'Socrates',
    },
    {
        id: 'feb65c48a1774041960b55e1156cac39',
        name: 'Monk',
    },
    {
        id: '8a5a849eff184046ae6bdb9a1825165c',
        name: 'Sleepy',
    },
    {
        id: '75e451f629a44984a2b54c26de2f9826',
        name: 'Steve Harvey',
    },
    {
        id: '0b2e96151d67433d93891f15efc25dbd',
        name: 'Trapaholics',
    },
    {
        id: 'd75c270eaee14c8aa1e9e980cc37cf1b',
        name: 'Peter Griffin',
    },
];

export function AppShell({ children }: { children: ReactNode }) {
    const [assistantMode, setAssistantMode] = useState<AssistantMode>('text');
    const [selectedVoiceId, setSelectedVoiceId] = useState(
        '271b3db7aa744ec4b311e00b288715ca'
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
                        voiceOptions={VOICE_OPTIONS}
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
