'use client';

import { useEffect, useRef, useState } from 'react';
import type {
    AssistantChatError,
    AssistantChatMessage,
    AssistantChatResponse,
    AssistantMode,
} from '@/features/assistant/types';
import type { AssistantVoiceOption } from '@/features/assistant/voices';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
    revealDurationMs?: number;
};

const CHAT_HISTORY_LIMIT = 12;

type AssistantChatProps = {
    mode: AssistantMode;
    onModeChange: (mode: AssistantMode) => void;
    onVoiceChange: (voiceId: string) => void;
    selectedVoiceId: string;
    voiceOptions: AssistantVoiceOption[];
};

export function AssistantChat({
    mode,
    onModeChange,
    onVoiceChange,
    selectedVoiceId,
    voiceOptions,
}: AssistantChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Good morning, Logan. How can I help you today?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isMicRecording, setIsMicRecording] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isMicRecordingRef = useRef(false);
    const committedTranscriptRef = useRef('');
    const assistantStatus = isMicRecording
        ? 'Listening'
        : isSpeaking
          ? 'Speaking'
          : isLoading
            ? 'Thinking'
            : 'Online';

    useEffect(() => {
        const messagesContainer = messagesContainerRef.current;

        if (!messagesContainer) {
            return;
        }

        requestAnimationFrame(() => {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth',
            });
        });
    }, [messages, isLoading]);

    async function prepareVoiceResponse(text: string) {
        if (!selectedVoiceId) {
            throw new Error('No voice selected.');
        }

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
        const durationMs = await loadAudioDuration(audio);

        audio.addEventListener('ended', () => URL.revokeObjectURL(audioUrl), {
            once: true,
        });

        return {
            audio,
            durationMs,
        };
    }

    function handleRecord() {
        const nextIsMicRecording = !isMicRecordingRef.current;
        isMicRecordingRef.current = nextIsMicRecording;
        setIsMicRecording(nextIsMicRecording);

        if (!nextIsMicRecording) {
            recognitionRef.current?.stop();
            return;
        }

        committedTranscriptRef.current = '';

        const SpeechRecognitionCtor =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition =
            recognitionRef.current ?? new SpeechRecognitionCtor();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onend = () => {
            if (isMicRecordingRef.current) {
                recognition.start();
            }
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const piece = event.results[i][0]?.transcript ?? '';

                if (event.results[i].isFinal) {
                    committedTranscriptRef.current += piece;
                } else {
                    interimTranscript += piece;
                }
            }

            setInput(
                `${committedTranscriptRef.current}${interimTranscript}`.trim()
            );
        };

        recognitionRef.current = recognition;
        recognition.start();
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

        const history: AssistantChatMessage[] = messages
            .map(({ role, content }) => ({
                role,
                content,
            }))
            .slice(-CHAT_HISTORY_LIMIT);

        setInput('');
        setErrorMessage('');
        setIsSpeaking(false);
        setIsLoading(true);
        if (isMicRecordingRef.current) {
            isMicRecordingRef.current = false;
            setIsMicRecording(false);
            recognitionRef.current?.stop();
        }
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
                body: JSON.stringify({ message, history }),
            });

            const data = (await response.json()) as
                | AssistantChatResponse
                | AssistantChatError;

            if (!response.ok) {
                throw new Error(data.message);
            }

            const assistantMessage = (data as AssistantChatResponse)
                .assistantMessage;

            if (mode === 'voice') {
                const voiceResponse =
                    await prepareVoiceResponse(assistantMessage);

                setIsLoading(false);
                setIsSpeaking(true);
                setMessages((current) => [
                    ...current,
                    {
                        role: 'assistant',
                        content: assistantMessage,
                        revealDurationMs: voiceResponse.durationMs,
                    },
                ]);

                voiceResponse.audio.addEventListener(
                    'ended',
                    () => setIsSpeaking(false),
                    { once: true }
                );
                voiceResponse.audio.addEventListener(
                    'error',
                    () => setIsSpeaking(false),
                    { once: true }
                );

                await voiceResponse.audio.play();
                return;
            }

            setMessages((current) => [
                ...current,
                {
                    role: 'assistant',
                    content: assistantMessage,
                },
            ]);
        } catch {
            setIsSpeaking(false);
            setErrorMessage('The assistant could not respond. Try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="flex min-h-0 flex-1 flex-col rounded-md border border-[#25392f] bg-[#0d1b17] p-4">
            <div className="mb-4 flex shrink-0 items-center justify-between gap-2 border-b border-[#25392f] pb-3">
                <button
                    className={`h-10 w-16 shrink-0 rounded-md border px-2 font-mono text-xs font-black uppercase transition ${
                        mode === 'voice'
                            ? 'border-[#50d678]/40 bg-[#17351f] text-[#50d678] hover:border-[#50d678]'
                            : 'border-[#f5bf76]/30 bg-[#241b10] text-[#f5bf76] hover:border-[#f5bf76]'
                    }`}
                    type="button"
                    onClick={() =>
                        onModeChange(mode === 'voice' ? 'text' : 'voice')
                    }
                    aria-label={`Switch to ${
                        mode === 'voice' ? 'text' : 'voice'
                    } mode`}
                    title={`Switch to ${
                        mode === 'voice' ? 'text' : 'voice'
                    } mode`}
                >
                    {mode}
                </button>

                {mode === 'voice' ? (
                    <>
                        <label className="sr-only" htmlFor="assistant-voice">
                            Assistant voice
                        </label>
                        <select
                            className="min-w-0 flex-1 rounded-md border border-[#f5bf76]/25 bg-[#08110f] px-3 py-2 font-mono text-sm font-black uppercase text-[#ff7b39] outline-none transition focus:border-[#50d678]"
                            id="assistant-voice"
                            value={selectedVoiceId}
                            onChange={(event) =>
                                onVoiceChange(event.target.value)
                            }
                        >
                            {voiceOptions.map((voice) => (
                                <option key={voice.id} value={voice.id}>
                                    {voice.name}
                                </option>
                            ))}
                        </select>
                    </>
                ) : null}

                <span className="shrink-0 font-mono text-sm text-[#50d678]">
                    {assistantStatus}
                </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                <div
                    className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
                    ref={messagesContainerRef}
                >
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
                                {message.role === 'assistant' &&
                                message.revealDurationMs ? (
                                    <AnimatedText
                                        durationMs={message.revealDurationMs}
                                        text={message.content}
                                    />
                                ) : (
                                    message.content
                                )}
                            </p>
                        </div>
                    ))}
                    {isLoading ? <AssistantThinkingMessage /> : null}
                </div>

                <form
                    className="mt-4 shrink-0 space-y-3"
                    onSubmit={handleSubmit}
                >
                    <div className="relative">
                        <textarea
                            className="min-h-28 w-full resize-none rounded-md border border-[#f5bf76]/25 bg-[#08110f] p-3 pb-14 text-sm text-[#f8e8c0] outline-none placeholder:text-[#796b52] focus:border-[#50d678]"
                            placeholder="Ask Vibetask to help plan, prioritize, or think through your work."
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                        />

                        <div className="absolute bottom-4 right-3 flex items-center gap-2">
                            <button
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff7b39] text-[#08110f] transition hover:bg-[#ff934f] disabled:cursor-not-allowed disabled:opacity-60"
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                aria-label={
                                    isLoading
                                        ? 'Assistant is thinking'
                                        : 'Send prompt'
                                }
                                title={
                                    isLoading
                                        ? 'Assistant is thinking'
                                        : 'Send prompt'
                                }
                            >
                                <svg
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.25"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 19V5" />
                                    <path d="m5 12 7-7 7 7" />
                                </svg>
                            </button>

                            <button
                                className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                                    isMicRecording
                                        ? 'border-[#50d678] bg-[#17351f] text-[#50d678]'
                                        : 'border-[#ff7b39]/50 bg-[#24130d] text-[#ffb14f] hover:border-[#ff7b39]'
                                }`}
                                type="button"
                                aria-label={
                                    isMicRecording
                                        ? 'Stop recording'
                                        : 'Press to talk'
                                }
                                title={
                                    isMicRecording
                                        ? 'Stop recording'
                                        : 'Press to talk'
                                }
                                aria-pressed={isMicRecording}
                                onClick={handleRecord}
                            >
                                <svg
                                    aria-hidden="true"
                                    className="h-4 w-4"
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
                    </div>

                    {errorMessage ? (
                        <p className="text-sm font-bold text-[#ff674d]">
                            {errorMessage}
                        </p>
                    ) : null}
                </form>
            </div>
        </section>
    );
}

function AnimatedText({
    text,
    durationMs,
}: {
    text: string;
    durationMs: number;
}) {
    const characterFadeMs = 180;
    const characters = Array.from(text);
    const totalDelayMs = Math.max(durationMs - characterFadeMs, 0);
    const delayStepMs =
        characters.length > 1 ? totalDelayMs / (characters.length - 1) : 0;

    return (
        <>
            {characters.map((character, index) => (
                <span
                    className="assistant-character-fade"
                    key={`${character}-${index}`}
                    style={{
                        animationDelay: `${index * delayStepMs}ms`,
                    }}
                >
                    {character}
                </span>
            ))}
        </>
    );
}

function AssistantThinkingMessage() {
    return (
        <div
            className="rounded-md border border-[#f5bf76]/20 bg-[#08110f] p-4"
            aria-label="Assistant response is being generated"
        >
            <div className="flex h-6 items-center gap-2">
                <span className="sr-only">
                    Assistant response is being generated.
                </span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#50d678]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#f5bf76] [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#ff7b39] [animation-delay:240ms]" />
                <span className="ml-2 h-px flex-1 animate-pulse bg-gradient-to-r from-[#50d678] via-[#f5bf76] to-transparent" />
            </div>
        </div>
    );
}

function loadAudioDuration(audio: HTMLAudioElement) {
    return new Promise<number>((resolve, reject) => {
        audio.onloadedmetadata = () => {
            const durationSeconds = Number.isFinite(audio.duration)
                ? audio.duration
                : 0;

            resolve(Math.max(durationSeconds * 1000, 1000));
        };

        audio.onerror = () => {
            reject(new Error('Unable to load voice response audio.'));
        };

        audio.load();
    });
}
