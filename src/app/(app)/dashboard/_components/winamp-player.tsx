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
                }
            });

            await webamp.renderWhenReady(pageRef.current);

            if (!disposedRef.current) {
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

    const controlsDisabled = status !== 'ready';
    const controlClassName =
        'grid size-7 shrink-0 place-items-center rounded border border-[#f5bf76]/30 bg-[#172721] font-mono text-[10px] font-black text-[#50d678] transition hover:border-[#ff7b39] hover:bg-[#ff7b39] hover:text-[#08110f] disabled:cursor-not-allowed disabled:opacity-40';

    return (
        <>
            <section
                aria-label="Winamp music player"
                className="grid place-items-center rounded-md border border-[#f5bf76]/20 bg-[#08110f] p-3"
            >
                <div className="text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5bf76]">
                        Winamp
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                        <button
                            type="button"
                            aria-pressed={isOpen}
                            disabled={
                                status === 'loading' ||
                                status === 'unsupported'
                            }
                            onClick={() => void togglePlayer()}
                            className="h-7 min-w-0 flex-1 rounded border border-[#ff7b39] bg-[#172721] px-1 font-mono text-[9px] font-black uppercase text-[#ffb14f] transition hover:bg-[#ff7b39] hover:text-[#08110f] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {status === 'loading'
                                ? 'Loading'
                                : isOpen
                                  ? 'Hide'
                                  : 'Show'}
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
