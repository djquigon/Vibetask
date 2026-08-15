'use client';

import Image from 'next/image';
import characterBackground from '@/features/assistant/assets/backgrounds/character-bg.png';
import { useEffect, useRef, useState } from 'react';
import type {
    AssistantChatError,
    AssistantChatMessage,
    AssistantChatResponse,
    AssistantMode,
} from '@/features/assistant/types';
import type { AssistantVoiceOption } from '@/features/assistant/voices';
import { useCurrentUser } from '@/features/profile/hooks/use-current-user';

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

function buildGreeting(displayName: string | null | undefined) {
    const name = displayName?.trim();

    return name
        ? `Good morning, ${name}. How can I help you today?`
        : 'Good morning. How can I help you today?';
}

export function AssistantChat({
    mode,
    onModeChange,
    onVoiceChange,
    selectedVoiceId,
    voiceOptions,
}: AssistantChatProps) {
    const currentUser = useCurrentUser();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: buildGreeting(currentUser?.displayName),
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
    const selectedVoice = voiceOptions.find(
        (voice) => voice.id === selectedVoiceId
    );

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
        <section className="flex min-h-0 flex-1 flex-col rounded-md border border-vt-border bg-vt-surface p-4">
            <div className="mb-4 flex shrink-0 items-center justify-between gap-2 border-b border-vt-border pb-3">
                <button
                    className={`h-10 w-16 shrink-0 rounded-md border px-2 font-mono text-xs font-black uppercase transition ${
                        mode === 'voice'
                            ? 'border-vt-green/40 bg-vt-green-active text-vt-green hover:border-vt-green'
                            : 'border-vt-border-strong bg-vt-amber-surface text-vt-amber hover:border-vt-border-highlight'
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
                            className="min-w-0 flex-1 rounded-md border border-vt-border bg-vt-background px-3 py-2 font-mono text-sm font-black uppercase text-vt-primary outline-none transition focus:border-vt-green"
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

                <span className="shrink-0 font-mono text-sm text-vt-green">
                    {assistantStatus}
                </span>
            </div>

            {mode === 'voice' ? (
                <AssistantPortrait
                    voice={selectedVoice}
                    isSpeaking={isSpeaking}
                />
            ) : null}

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
                                    ? 'rounded-md border border-vt-green/30 bg-vt-user-surface p-4'
                                    : 'rounded-md border border-vt-border bg-vt-background p-4'
                            }
                        >
                            <p className="text-sm leading-6 text-vt-text">
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
                            className="min-h-28 w-full resize-none rounded-md border border-vt-border bg-vt-background p-3 pb-14 text-sm text-vt-text outline-none placeholder:text-vt-text-faint focus:border-vt-green"
                            placeholder="Ask Vibetask to help plan, prioritize, or think through your work."
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                        />

                        <div className="absolute bottom-4 right-3 flex items-center gap-2">
                            <button
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-vt-primary text-vt-ink transition hover:bg-vt-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
                                        ? 'border-vt-green bg-vt-green-active text-vt-green'
                                        : 'border-vt-border-strong/50 bg-vt-primary-surface text-vt-icon hover:border-vt-border-strong'
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
                        <p className="text-sm font-bold text-vt-red">
                            {errorMessage}
                        </p>
                    ) : null}
                </form>
            </div>
        </section>
    );
}

function AssistantPortrait({
    voice,
    isSpeaking,
}: {
    voice: AssistantVoiceOption | undefined;
    isSpeaking: boolean;
}) {
    const [displayedVoice, setDisplayedVoice] = useState(voice);
    const [isSwitchingVoice, setIsSwitchingVoice] = useState(false);

    useEffect(() => {
        if (voice?.id === displayedVoice?.id) {
            return;
        }

        const fadeTimer = window.setTimeout(() => {
            setIsSwitchingVoice(true);
        }, 0);

        const swapTimer = window.setTimeout(() => {
            setDisplayedVoice(voice);
            setIsSwitchingVoice(false);
        }, 180);

        return () => {
            window.clearTimeout(fadeTimer);
            window.clearTimeout(swapTimer);
        };
    }, [displayedVoice?.id, voice]);

    return (
        <div
            className={`assistant-portrait mb-4 h-48 shrink-0 overflow-hidden rounded-md border border-vt-border-strong bg-vt-background bg-cover bg-center sm:h-52 ${
                isSpeaking ? 'assistant-portrait-speaking' : ''
            }`}
            style={{ backgroundImage: `url(${characterBackground.src})` }}
        >
            <div
                className={`h-full w-full ${
                    isSwitchingVoice
                        ? 'assistant-portrait-fade-out'
                        : 'assistant-portrait-fade-in'
                }`}
            >
                {displayedVoice?.characterImage ? (
                    <Image
                        key={displayedVoice.id}
                        src={displayedVoice.characterImage}
                        alt={`${displayedVoice.name} assistant portrait`}
                        className={`h-full w-full object-contain object-bottom ${
                            isSpeaking
                                ? 'assistant-portrait-image-speaking'
                                : 'assistant-portrait-image-idle'
                        }`}
                        sizes="(min-width: 1024px) 340px, 100vw"
                        priority
                    />
                ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center font-mono text-sm text-vt-amber">
                        {displayedVoice
                            ? `${displayedVoice.name} needs a character portrait.`
                            : 'Select an assistant voice.'}
                    </div>
                )}
            </div>
        </div>
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
            className="rounded-md border border-vt-border bg-vt-background p-4"
            aria-label="Assistant response is being generated"
        >
            <div className="flex h-6 items-center gap-2">
                <span className="sr-only">
                    Assistant response is being generated.
                </span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-vt-green" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-vt-amber [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-vt-primary [animation-delay:240ms]" />
                <span className="ml-2 h-px flex-1 animate-pulse bg-gradient-to-r from-vt-green via-vt-amber to-transparent" />
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
