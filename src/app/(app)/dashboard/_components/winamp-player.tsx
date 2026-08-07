'use client';

import type Webamp from 'webamp';
import { useEffect, useRef, useState } from 'react';

type PlayerStatus = 'idle' | 'loading' | 'ready' | 'unsupported' | 'error';

const WINAMP_WINDOW_HEIGHT = 116;

export function WinampPlayer() {
    const pageRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Webamp | null>(null);
    const unsubscribeCloseRef = useRef<(() => void) | null>(null);
    const unsubscribeStateRef = useRef<(() => void) | null>(null);
    const disposedRef = useRef(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);
    const [status, setStatus] = useState<PlayerStatus>('idle');

    useEffect(() => {
        disposedRef.current = false;

        return () => {
            disposedRef.current = true;
            unsubscribeCloseRef.current?.();
            unsubscribeStateRef.current?.();
            playerRef.current?.dispose();
            playerRef.current = null;
        };
    }, []);

    function setPlayerVisibility(isVisible: boolean) {
        const webampElement = document.getElementById('webamp');

        if (webampElement) {
            webampElement.style.display = isVisible ? '' : 'none';
        }
    }

    async function togglePlayer() {
        if (isOpen) {
            setIsOpen(false);
            setPlayerVisibility(false);
            return;
        }

        setIsOpen(true);

        if (playerRef.current) {
            if (playerRef.current.getPlayerMediaStatus() === 'CLOSED') {
                playerRef.current.reopen();
            }

            setPlayerVisibility(true);
            return;
        }

        setStatus('loading');

        try {
            const { default: WebampPlayer } =
                await import('webamp/butterchurn');

            if (disposedRef.current || !pageRef.current) {
                return;
            }

            if (!WebampPlayer.browserIsSupported()) {
                setStatus('unsupported');
                setIsOpen(false);
                return;
            }

            const webamp = new WebampPlayer({
                enableHotkeys: false,
                enableMediaSession: true,
                zIndex: 100,
                windowLayout: {
                    main: {
                        position: { top: 0, left: 0 },
                    },
                    equalizer: {
                        position: {
                            top: WINAMP_WINDOW_HEIGHT,
                            left: 0,
                        },
                    },
                    playlist: {
                        position: {
                            top: WINAMP_WINDOW_HEIGHT * 2,
                            left: 0,
                        },
                        size: {
                            extraHeight: 0,
                            extraWidth: 0,
                        },
                    },
                    milkdrop: {
                        position: {
                            top: 0,
                            left: 275,
                        },
                        size: {
                            extraHeight: 12,
                            extraWidth: 7,
                        },
                    },
                },
            });

            playerRef.current = webamp;
            unsubscribeCloseRef.current = webamp.onClose(() => {
                setIsOpen(false);
                setIsPlaying(false);
            });
            unsubscribeStateRef.current = webamp.__onStateChange(() => {
                if (!disposedRef.current) {
                    setIsPlaying(webamp.getMediaStatus() === 'PLAYING');
                    setVolume(webamp.store.getState().media.volume);
                }
            });

            await webamp.renderWhenReady(pageRef.current);

            if (!disposedRef.current) {
                setVolume(webamp.store.getState().media.volume);
                setStatus('ready');
            }
        } catch {
            playerRef.current?.dispose();
            playerRef.current = null;

            if (!disposedRef.current) {
                setStatus('error');
                setIsOpen(false);
            }
        }
    }

    function togglePlayback() {
        const player = playerRef.current;

        if (!player) {
            return;
        }

        if (player.getMediaStatus() === 'PLAYING') {
            player.pause();
        } else {
            player.play();
        }
    }

    function changeVolume(nextVolume: number) {
        setVolume(nextVolume);
        playerRef.current?.setVolume(nextVolume);
    }

    const controlsDisabled = status !== 'ready';
    const controlClassName =
        'grid size-7 shrink-0 place-items-center rounded border border-[#f5bf76]/30 bg-[#172721] font-mono text-[10px] font-black text-[#50d678] transition hover:border-[#ff7b39] hover:bg-[#ff7b39] hover:text-[#08110f] disabled:cursor-not-allowed disabled:opacity-40';

    return (
        <>
            <section
                aria-label="Winamp music player"
                className="grid place-items-center rounded-md border border-[#f5bf76]/20 bg-[#08110f] p-3"
            >
                <div className="w-full min-w-0 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5bf76]">
                        Winamp
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                        <button
                            type="button"
                            aria-pressed={isOpen}
                            aria-label={
                                isOpen ? 'Hide Winamp' : 'Show Winamp'
                            }
                            title={isOpen ? 'Hide Winamp' : 'Show Winamp'}
                            disabled={
                                status === 'loading' ||
                                status === 'unsupported'
                            }
                            onClick={() => void togglePlayer()}
                            className="grid size-7 shrink-0 place-items-center rounded border border-[#ff7b39] bg-[#172721] text-[#ffb14f] transition hover:bg-[#ff7b39] hover:text-[#08110f] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="size-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                                <circle cx="12" cy="12" r="2.5" />
                                {isOpen && <path d="M3 3l18 18" />}
                            </svg>
                        </button>
                        <button
                            type="button"
                            aria-label="Previous track"
                            title="Previous track"
                            disabled={controlsDisabled}
                            onClick={() => playerRef.current?.previousTrack()}
                            className={controlClassName}
                        >
                            ◀|
                        </button>
                        <button
                            type="button"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            title={isPlaying ? 'Pause' : 'Play'}
                            disabled={controlsDisabled}
                            onClick={togglePlayback}
                            className={controlClassName}
                        >
                            {isPlaying ? 'Ⅱ' : '▶'}
                        </button>
                        <button
                            type="button"
                            aria-label="Stop"
                            title="Stop"
                            disabled={controlsDisabled}
                            onClick={() => playerRef.current?.stop()}
                            className={controlClassName}
                        >
                            ■
                        </button>
                        <button
                            type="button"
                            aria-label="Next track"
                            title="Next track"
                            disabled={controlsDisabled}
                            onClick={() => playerRef.current?.nextTrack()}
                            className={controlClassName}
                        >
                            |▶
                        </button>
                    </div>
                    <label className="mt-2 flex w-full min-w-0 items-center gap-2 font-mono text-[9px] font-bold uppercase text-[#f5bf76]">
                        <span>Vol</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={volume}
                            disabled={controlsDisabled}
                            aria-label="Player volume"
                            onChange={(event) =>
                                changeVolume(Number(event.target.value))
                            }
                            className="h-1 min-w-0 flex-1 cursor-pointer accent-[#ff7b39] disabled:cursor-not-allowed disabled:opacity-40"
                        />
                        <span className="w-6 text-right text-[#50d678]">
                            {volume}
                        </span>
                    </label>
                    <p className="mt-2 font-mono text-[9px] uppercase text-[#50d678]">
                        {status === 'unsupported'
                            ? 'Browser unsupported'
                            : status === 'error'
                              ? 'Player failed to load'
                              : isOpen
                                ? 'Drag windows anywhere'
                                : 'Player hidden'}
                    </p>
                </div>
            </section>
            <div
                ref={pageRef}
                aria-hidden="true"
                className="pointer-events-none fixed inset-0"
            />
        </>
    );
}
