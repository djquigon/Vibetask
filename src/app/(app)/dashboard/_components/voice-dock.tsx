'use client';

import { useState } from 'react';
import type { AssistantMode } from '@/features/assistant/types';

export function VoiceDock() {
    const [mode, setMode] = useState<AssistantMode>('text');

    return (
        <section className="rounded-md border border-[#25392f] bg-[#0d1b17] p-4">
            <div className="mb-4 flex items-center justify-between border-b border-[#25392f] pb-3">
                <div>
                    <p className="font-mono text-sm font-bold uppercase text-[#50d678]">
                        Voice Controls
                    </p>
                    <p className="mt-1 text-sm text-[#d8c79f]">
                        {mode === 'voice'
                            ? 'Voice responses enabled'
                            : 'Text responses only'}
                    </p>
                </div>
                <span className="font-mono text-xs font-bold uppercase text-[#f5bf76]">
                    {mode}
                </span>
            </div>

            <div className="grid grid-cols-1">
                <div className="grid grid-cols-2 rounded-md border border-[#f5bf76]/25 bg-[#08110f] p-1">
                    <button
                        className={`rounded px-3 py-2 text-sm font-bold transition ${
                            mode === 'text'
                                ? 'bg-[#f5bf76] text-[#08110f]'
                                : 'text-[#f8e8c0] hover:bg-[#172721]'
                        }`}
                        type="button"
                        onClick={() => setMode('text')}
                    >
                        Text
                    </button>
                    <button
                        className={`rounded px-3 py-2 text-sm font-bold transition ${
                            mode === 'voice'
                                ? 'bg-[#50d678] text-[#08110f]'
                                : 'text-[#f8e8c0] hover:bg-[#172721]'
                        }`}
                        type="button"
                        onClick={() => setMode('voice')}
                    >
                        Voice
                    </button>
                </div>
            </div>
        </section>
    );
}
