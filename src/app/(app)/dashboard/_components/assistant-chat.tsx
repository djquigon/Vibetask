'use client';

import { useState } from 'react';
import type {
    AssistantChatError,
    AssistantChatResponse,
    AssistantMode,
} from '@/features/assistant/types';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

type AssistantChatProps = {
    mode: AssistantMode;
    selectedVoiceId: string;
};

export function AssistantChat({ mode, selectedVoiceId }: AssistantChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content:
                'Good morning. Want me to build a focused plan from your open tasks, meetings, and available energy?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVoiceLoading, setIsVoiceLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function playVoiceResponse(text: string) {
        if (!selectedVoiceId) {
            throw new Error('No voice selected.');
        }

        setIsVoiceLoading(true);

        try {
            const response = await fetch('/api/assistant/voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    voiceId: selectedVoiceId,
                }),
            });

            if (!response.ok) {
                throw new Error('Unable to generate voice response.');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();
        } finally {
            setIsVoiceLoading(false);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const message = input.trim();

        if (message.length > 4000) {
            setErrorMessage(
                'Message is too long. Please keep it under 4000 characters.'
            );
            return;
        }

        if (!message || isLoading) {
            return;
        }

        setInput('');
        setErrorMessage('');
        setIsLoading(true);
        setMessages((current) => [
            ...current,
            { role: 'user', content: message },
        ]);

        try {
            const response = await fetch('/api/assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = (await response.json()) as
                | AssistantChatResponse
                | AssistantChatError;

            if (!response.ok) {
                throw new Error(data.message);
            }

            const assistantMessage = (data as AssistantChatResponse)
                .assistantMessage;

            setMessages((current) => [
                ...current,
                {
                    role: 'assistant',
                    content: assistantMessage,
                },
            ]);

            if (mode === 'voice') {
                await playVoiceResponse(assistantMessage);
            }
        } catch {
            setErrorMessage('The assistant could not respond. Try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="rounded-md border border-[#25392f] bg-[#0d1b17] p-4">
            <div className="mb-4 flex items-center justify-between border-b border-[#25392f] pb-3">
                <h2 className="font-mono text-lg font-black uppercase text-[#ff7b39]">
                    AI Assistant
                </h2>
                <span className="font-mono text-sm text-[#50d678]">
                    {isVoiceLoading ? 'SPEAKING' : 'ONLINE'}
                </span>
            </div>

            <div>
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={`${message.role}-${index}`}
                            className={
                                message.role === 'user'
                                    ? 'rounded-md border border-[#50d678]/30 bg-[#0f2b1a] p-4'
                                    : 'rounded-md border border-[#f5bf76]/20 bg-[#08110f] p-4'
                            }
                        >
                            <p className="text-sm leading-6 text-[#f8e8c0]">
                                {message.content}
                            </p>
                        </div>
                    ))}
                </div>

                <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                    <textarea
                        className="min-h-24 w-full resize-none rounded-md border border-[#f5bf76]/25 bg-[#08110f] p-3 text-sm text-[#f8e8c0] outline-none placeholder:text-[#796b52] focus:border-[#50d678]"
                        placeholder="Ask Vibetask to help plan, prioritize, or think through your work."
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                    />

                    {errorMessage ? (
                        <p className="text-sm font-bold text-[#ff674d]">
                            {errorMessage}
                        </p>
                    ) : null}

                    <div className="grid grid-cols-[1fr_48px] gap-2">
                        <button
                            className="rounded-md bg-[#ff7b39] px-3 py-2 text-sm font-bold text-[#08110f] disabled:cursor-not-allowed disabled:opacity-60"
                            type="submit"
                            disabled={isLoading || !input.trim()}
                        >
                            {isLoading ? 'Thinking...' : 'Send prompt'}
                        </button>

                        <button
                            className="flex h-10 w-12 items-center justify-center rounded-md border border-[#ff7b39]/50 bg-[#24130d] text-[#ffb14f] transition hover:border-[#ff7b39]"
                            type="button"
                            aria-label="Press to talk"
                            title="Press to talk"
                        >
                            <svg
                                aria-hidden="true"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <path d="M12 19v3" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
