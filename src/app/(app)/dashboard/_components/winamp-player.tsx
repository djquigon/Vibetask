'use client';

import type Webamp from 'webamp';
import type { WindowPositions } from 'webamp';
import { useEffect, useRef, useState } from 'react';

type PlayerStatus = 'idle' | 'loading' | 'ready' | 'unsupported' | 'error';
type ResizableWindowSizes = Record<'playlist' | 'milkdrop', [number, number]>;

const WINAMP_WINDOW_WIDTH = 275;
const WINAMP_WINDOW_HEIGHT = 116;
const WINAMP_RESIZE_WIDTH = 25;
const WINAMP_RESIZE_HEIGHT = 29;
const DOCKED_MILKDROP_SIZE: [number, number] = [0, 2];

export function WinampPlayer() {
    const pageRef = useRef<HTMLDivElement>(null);
    const milkdropDockRef = useRef<HTMLElement>(null);
    const musicUploadInputRef = useRef<HTMLInputElement>(null);
    const nowPlayingViewportRef = useRef<HTMLDivElement>(null);
    const nowPlayingTextRef = useRef<HTMLSpanElement>(null);
    const playerRef = useRef<Webamp | null>(null);
    const unsubscribeCloseRef = useRef<(() => void) | null>(null);
    const unsubscribeStateRef = useRef<(() => void) | null>(null);
    const webampElementRef = useRef<HTMLElement | null>(null);
    const popoutWindowRef = useRef<Window | null>(null);
    const popoutResizeCleanupRef = useRef<(() => void) | null>(null);
    const originalWindowPositionsRef = useRef<WindowPositions | null>(null);
    const originalWindowSizesRef = useRef<ResizableWindowSizes | null>(null);
    const dockedMilkdropLayoutRef = useRef<{
        position: { x: number; y: number };
        size: [number, number];
    } | null>(null);
    const isOpenRef = useRef(false);
    const wasPlayingRef = useRef(false);
    const disposedRef = useRef(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMilkdropPoppedOut, setIsMilkdropPoppedOut] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [nowPlaying, setNowPlaying] = useState('No track selected');
    const [isNowPlayingOverflowing, setIsNowPlayingOverflowing] =
        useState(false);
    const [volume, setVolume] = useState(100);
    const [popoutError, setPopoutError] = useState(false);
    const [status, setStatus] = useState<PlayerStatus>('idle');

    useEffect(() => {
        disposedRef.current = false;

        return () => {
            disposedRef.current = true;
            popoutWindowRef.current?.close();
            const webampElement = webampElementRef.current;

            if (
                webampElement &&
                webampElement.parentElement !== document.body
            ) {
                document.body.appendChild(webampElement);
            }

            unsubscribeCloseRef.current?.();
            unsubscribeStateRef.current?.();
            playerRef.current?.dispose();
            playerRef.current = null;
        };
    }, []);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        const viewport = nowPlayingViewportRef.current;
        const text = nowPlayingTextRef.current;

        if (!viewport || !text) {
            return;
        }

        let frameId = window.requestAnimationFrame(updateOverflowState);
        const resizeObserver = new ResizeObserver(() => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(updateOverflowState);
        });

        resizeObserver.observe(viewport);
        resizeObserver.observe(text);

        return () => {
            window.cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
        };

        function updateOverflowState() {
            const currentViewport = nowPlayingViewportRef.current;
            const currentText = nowPlayingTextRef.current;

            if (!currentViewport || !currentText) {
                return;
            }

            setIsNowPlayingOverflowing(
                currentText.scrollWidth > currentViewport.clientWidth + 1
            );
        }
    }, [isNowPlayingOverflowing, nowPlaying]);

    function setPlayerVisibility(isVisible: boolean) {
        const player = playerRef.current;

        if (!player) {
            return;
        }

        const popout = popoutWindowRef.current;

        if (popout && !popout.closed) {
            const popoutWebampElement =
                popout.document.getElementById('webamp');

            if (popoutWebampElement) {
                popoutWebampElement.style.display = isVisible ? '' : 'none';
            }

            return;
        }

        const showDockedMilkdrop =
            !isVisible && player.getMediaStatus() === 'PLAYING';

        if (isVisible) {
            const webampElement = webampElementRef.current;

            if (
                webampElement &&
                webampElement.parentElement !== document.body
            ) {
                document.body.appendChild(webampElement);
            }

            restoreDockedMilkdropLayout(player);
        } else if (showDockedMilkdrop) {
            layoutDockedMilkdrop(player);
        }

        const mountedWebampElement = document.getElementById('webamp');

        if (!mountedWebampElement) {
            return;
        }

        setWebampWindowVisibility(
            mountedWebampElement,
            isVisible,
            isVisible || showDockedMilkdrop
        );
        mountedWebampElement.style.display =
            isVisible || showDockedMilkdrop ? '' : 'none';
    }

    function setWebampWindowVisibility(
        webampElement: HTMLElement,
        showPlayerWindows: boolean,
        showMilkdrop: boolean
    ) {
        webampElement.style.pointerEvents = showPlayerWindows ? '' : 'none';

        webampElement
            .querySelectorAll<HTMLElement>(
                '#main-window, #equalizer-window, #playlist-window'
            )
            .forEach((windowElement) => {
                windowElement.style.display = showPlayerWindows ? '' : 'none';
            });

        webampElement
            .querySelector<HTMLElement>('canvas')
            ?.closest<HTMLElement>('.gen-window')
            ?.style.setProperty('display', showMilkdrop ? '' : 'none');
    }

    function layoutDockedMilkdrop(player: Webamp) {
        if (isOpenRef.current || player.getMediaStatus() !== 'PLAYING') {
            return;
        }

        const milkdropDock = milkdropDockRef.current;
        const webampElement = webampElementRef.current;

        if (!milkdropDock || !webampElement) {
            requestAnimationFrame(() => {
                if (!disposedRef.current) {
                    layoutDockedMilkdrop(player);
                }
            });
            return;
        }

        if (!milkdropDock.contains(webampElement)) {
            milkdropDock.appendChild(webampElement);
        }

        const milkdropWindow =
            player.store.getState().windows.genWindows.milkdrop;

        if (!dockedMilkdropLayoutRef.current) {
            dockedMilkdropLayoutRef.current = {
                position: { ...milkdropWindow.position },
                size: [...milkdropWindow.size],
            };
        }

        const milkdropWidth =
            WINAMP_WINDOW_WIDTH + DOCKED_MILKDROP_SIZE[0] * WINAMP_RESIZE_WIDTH;

        player.store.dispatch({
            type: 'WINDOW_SIZE_CHANGED',
            windowId: 'milkdrop',
            size: DOCKED_MILKDROP_SIZE,
        });
        player.store.dispatch({
            type: 'UPDATE_WINDOW_POSITIONS',
            positions: {
                milkdrop: {
                    x: Math.round(
                        (milkdropDock.clientWidth - milkdropWidth) / 2
                    ),
                    y: 0,
                },
            },
            absolute: true,
        });
    }

    function restoreDockedMilkdropLayout(player: Webamp) {
        const savedLayout = dockedMilkdropLayoutRef.current;

        if (!savedLayout) {
            return;
        }

        player.store.dispatch({
            type: 'WINDOW_SIZE_CHANGED',
            windowId: 'milkdrop',
            size: savedLayout.size,
        });
        player.store.dispatch({
            type: 'UPDATE_WINDOW_POSITIONS',
            positions: {
                milkdrop: savedLayout.position,
            },
            absolute: true,
        });
        dockedMilkdropLayoutRef.current = null;
    }

    function layoutPopoutWindows(popout: Window, player: Webamp) {
        const playlistExtraHeight = Math.max(
            0,
            Math.round(
                (popout.innerHeight - WINAMP_WINDOW_HEIGHT * 3) /
                    WINAMP_RESIZE_HEIGHT
            )
        );
        const milkdropExtraWidth = Math.max(
            0,
            Math.round(
                (popout.innerWidth - WINAMP_WINDOW_WIDTH * 2) /
                    WINAMP_RESIZE_WIDTH
            )
        );
        const milkdropExtraHeight = playlistExtraHeight + 8;
        const contentWidth =
            WINAMP_WINDOW_WIDTH * 2 + milkdropExtraWidth * WINAMP_RESIZE_WIDTH;
        const contentHeight =
            WINAMP_WINDOW_HEIGHT * 3 +
            playlistExtraHeight * WINAMP_RESIZE_HEIGHT;

        player.store.dispatch({
            type: 'WINDOW_SIZE_CHANGED',
            windowId: 'playlist',
            size: [0, playlistExtraHeight],
        });
        player.store.dispatch({
            type: 'WINDOW_SIZE_CHANGED',
            windowId: 'milkdrop',
            size: [milkdropExtraWidth, milkdropExtraHeight],
        });
        player.store.dispatch({
            type: 'UPDATE_WINDOW_POSITIONS',
            positions: {
                main: { x: 0, y: 0 },
                equalizer: { x: 0, y: WINAMP_WINDOW_HEIGHT },
                playlist: { x: 0, y: WINAMP_WINDOW_HEIGHT * 2 },
                milkdrop: { x: WINAMP_WINDOW_WIDTH, y: 0 },
            },
            absolute: true,
        });

        const outerWidth =
            contentWidth + (popout.outerWidth - popout.innerWidth);
        const outerHeight =
            contentHeight + (popout.outerHeight - popout.innerHeight);

        if (
            Math.abs(popout.innerWidth - contentWidth) > 1 ||
            Math.abs(popout.innerHeight - contentHeight) > 1
        ) {
            popout.resizeTo(outerWidth, outerHeight);
        }
    }

    function restoreMilkdrop() {
        const player = playerRef.current;
        const webampElement = webampElementRef.current;

        popoutResizeCleanupRef.current?.();
        popoutResizeCleanupRef.current = null;

        if (webampElement && webampElement.parentElement !== document.body) {
            document.body.appendChild(webampElement);
        }

        if (player) {
            if (webampElement) {
                setWebampWindowVisibility(webampElement, true, true);
            }

            for (const windowId of ['main', 'equalizer', 'playlist'] as const) {
                player.store.dispatch({
                    type: 'SET_WINDOW_VISIBILITY',
                    windowId,
                    hidden: false,
                });
            }

            if (originalWindowSizesRef.current) {
                for (const windowId of ['playlist', 'milkdrop'] as const) {
                    player.store.dispatch({
                        type: 'WINDOW_SIZE_CHANGED',
                        windowId,
                        size: originalWindowSizesRef.current[windowId],
                    });
                }
            }

            if (originalWindowPositionsRef.current) {
                player.store.dispatch({
                    type: 'UPDATE_WINDOW_POSITIONS',
                    positions: originalWindowPositionsRef.current,
                    absolute: true,
                });
            }
        }

        popoutWindowRef.current = null;

        if (!disposedRef.current) {
            setIsMilkdropPoppedOut(false);
        }
    }

    function toggleMilkdropPopout() {
        const player = playerRef.current;
        const webampElement = webampElementRef.current;
        const existingPopout = popoutWindowRef.current;

        if (existingPopout && !existingPopout.closed) {
            existingPopout.close();
            return;
        }

        if (!player || !webampElement) {
            return;
        }

        const popout = window.open(
            '',
            'vibetask-milkdrop',
            'popup=yes,width=760,height=620,resizable=yes'
        );

        if (!popout) {
            setPopoutError(true);
            return;
        }

        setPopoutError(false);
        popout.document.title = 'Vibetask Winamp';
        popout.document.documentElement.dataset.theme =
            document.documentElement.dataset.theme ?? 'default';
        popout.document.body.style.margin = '0';
        popout.document.body.style.overflow = 'hidden';
        popout.document.body.style.background = getComputedStyle(
            document.documentElement
        )
            .getPropertyValue('--vt-background')
            .trim();

        document
            .querySelectorAll('style, link[rel="stylesheet"]')
            .forEach((stylesheet) => {
                popout.document.head.appendChild(stylesheet.cloneNode(true));
            });

        const positions: WindowPositions = {};
        const windows = player.store.getState().windows.genWindows;

        for (const [windowId, windowState] of Object.entries(windows)) {
            positions[windowId] = { ...windowState.position };
        }

        originalWindowPositionsRef.current = positions;
        originalWindowSizesRef.current = {
            playlist: [...windows.playlist.size],
            milkdrop: [...windows.milkdrop.size],
        };

        setWebampWindowVisibility(webampElement, true, true);

        for (const windowId of [
            'main',
            'equalizer',
            'playlist',
            'milkdrop',
        ] as const) {
            player.store.dispatch({
                type: 'SET_WINDOW_VISIBILITY',
                windowId,
                hidden: false,
            });
        }

        webampElement.style.display = '';
        popout.document.body.appendChild(webampElement);
        layoutPopoutWindows(popout, player);

        let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
        const handleResize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            resizeTimeout = setTimeout(() => {
                if (!popout.closed) {
                    layoutPopoutWindows(popout, player);
                }
            }, 100);
        };

        popout.addEventListener('resize', handleResize);
        popoutResizeCleanupRef.current = () => {
            popout.removeEventListener('resize', handleResize);

            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
        };
        popout.addEventListener('beforeunload', restoreMilkdrop, {
            once: true,
        });
        popoutWindowRef.current = popout;
        setIsOpen(true);
        setIsMilkdropPoppedOut(true);
        popout.focus();
    }

    async function togglePlayer() {
        if (isOpen) {
            isOpenRef.current = false;
            setIsOpen(false);
            setPlayerVisibility(false);
            return;
        }

        isOpenRef.current = true;
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
                isOpenRef.current = false;
                setIsOpen(false);
                setIsPlaying(false);
                wasPlayingRef.current = false;
            });
            unsubscribeStateRef.current = webamp.__onStateChange(() => {
                if (!disposedRef.current) {
                    const nextIsPlaying = webamp.getMediaStatus() === 'PLAYING';

                    setIsPlaying(nextIsPlaying);
                    setVolume(webamp.store.getState().media.volume);
                    setNowPlaying(getNowPlayingLabel(webamp));

                    if (nextIsPlaying !== wasPlayingRef.current) {
                        wasPlayingRef.current = nextIsPlaying;
                        setPlayerVisibility(isOpenRef.current);
                    }
                }
            });

            await webamp.renderWhenReady(pageRef.current);

            if (!disposedRef.current) {
                webampElementRef.current = document.getElementById('webamp');
                setVolume(webamp.store.getState().media.volume);
                setNowPlaying(getNowPlayingLabel(webamp));
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

    function getNowPlayingLabel(player: Webamp) {
        const playerState = player.store.getState();
        const trackId = playerState.playlist.currentTrack;

        if (trackId === null) {
            return 'No track selected';
        }

        const track = playerState.tracks[trackId];

        if (!track) {
            return 'Loading track...';
        }

        const artistAndTitle = [track.artist, track.title]
            .filter(Boolean)
            .join(' - ');

        return artistAndTitle || track.defaultName || 'Unknown track';
    }

    async function addMusicFiles(files: FileList | null) {
        const selectedFiles = Array.from(files ?? []).filter((file) =>
            file.type.startsWith('audio/')
        );

        if (selectedFiles.length === 0) {
            return;
        }

        let player = playerRef.current;

        if (!player) {
            await togglePlayer();
            player = playerRef.current;
        } else if (player.getPlayerMediaStatus() === 'CLOSED') {
            player.reopen();
        }

        if (!player) {
            return;
        }

        player.setTracksToPlay(
            selectedFiles.map((file) => ({
                blob: file,
                defaultName: file.name,
            }))
        );
        setNowPlaying(getNowPlayingLabel(player));
    }

    function handleMusicUpload(event: React.ChangeEvent<HTMLInputElement>) {
        void addMusicFiles(event.target.files);
        event.target.value = '';
    }

    const controlsDisabled = status !== 'ready';
    const uploadDisabled = status === 'loading' || status === 'unsupported';
    const isDockedMilkdropVisible =
        !isOpen && isPlaying && !isMilkdropPoppedOut;
    const controlClassName =
        'grid size-6 shrink-0 place-items-center rounded border border-vt-amber/30 bg-vt-green-hover font-mono text-[9px] font-black text-vt-green transition hover:border-vt-orange hover:bg-vt-orange hover:text-vt-ink disabled:cursor-not-allowed disabled:opacity-40';

    return (
        <>
            {isDockedMilkdropVisible && (
                <section
                    ref={milkdropDockRef}
                    aria-label="Milkdrop visualizer"
                    className="relative h-44 shrink-0 overflow-hidden rounded-md border border-vt-amber/20 bg-vt-background"
                />
            )}
            <section
                aria-label="Winamp music player"
                className="grid place-items-center rounded-md border border-vt-amber/20 bg-vt-background p-3"
            >
                <div className="w-full min-w-0 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-vt-amber">
                        Winamp
                    </p>
                    <div className="mt-2 min-w-0 border border-vt-amber/20 bg-vt-surface px-2 py-1.5 text-left">
                        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-vt-green">
                            Now playing
                        </p>
                        <div
                            ref={nowPlayingViewportRef}
                            className="mt-0.5 overflow-hidden"
                        >
                            {isNowPlayingOverflowing ? (
                                <div className="now-playing-marquee flex w-max whitespace-nowrap font-mono text-[10px] font-bold text-vt-text">
                                    <span
                                        ref={nowPlayingTextRef}
                                        title={nowPlaying}
                                        className="shrink-0 pr-8"
                                    >
                                        {nowPlaying}
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="shrink-0 pr-8"
                                    >
                                        {nowPlaying}
                                    </span>
                                </div>
                            ) : (
                                <span
                                    ref={nowPlayingTextRef}
                                    title={nowPlaying}
                                    className="block truncate font-mono text-[10px] font-bold text-vt-text"
                                >
                                    {nowPlaying}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                        <button
                            type="button"
                            aria-pressed={isOpen}
                            aria-label={isOpen ? 'Hide Winamp' : 'Show Winamp'}
                            title={isOpen ? 'Hide Winamp' : 'Show Winamp'}
                            disabled={
                                status === 'loading' || status === 'unsupported'
                            }
                            onClick={() => void togglePlayer()}
                            className="order-3 grid size-6 shrink-0 place-items-center rounded border border-vt-orange bg-vt-green-hover text-vt-gold transition hover:bg-vt-orange hover:text-vt-ink disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="size-3.5"
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
                            aria-pressed={isMilkdropPoppedOut}
                            aria-label={
                                isMilkdropPoppedOut
                                    ? 'Return Winamp to Vibetask'
                                    : 'Pop out Winamp'
                            }
                            title={
                                isMilkdropPoppedOut
                                    ? 'Return Winamp to Vibetask'
                                    : 'Pop out Winamp'
                            }
                            disabled={controlsDisabled}
                            onClick={toggleMilkdropPopout}
                            className={`order-3 ${controlClassName} ${
                                isMilkdropPoppedOut
                                    ? 'border-vt-orange text-vt-gold'
                                    : ''
                            }`}
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="size-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M14 3h7v7" />
                                <path d="M10 14 21 3" />
                                <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            aria-label="Add music files"
                            title="Add music files"
                            disabled={uploadDisabled}
                            onClick={() => musicUploadInputRef.current?.click()}
                            className={`order-3 ${controlClassName}`}
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="size-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 3v12" />
                                <path d="m8 7 4-4 4 4" />
                                <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
                            </svg>
                        </button>
                        <input
                            ref={musicUploadInputRef}
                            type="file"
                            accept="audio/*,.aac,.flac,.m4a,.mp3,.ogg,.wav"
                            multiple
                            onChange={handleMusicUpload}
                            className="sr-only"
                        />
                        <button
                            type="button"
                            aria-label="Previous track"
                            title="Previous track"
                            disabled={controlsDisabled}
                            onClick={() => playerRef.current?.previousTrack()}
                            className={`order-1 ${controlClassName}`}
                        >
                            ◀|
                        </button>
                        <button
                            type="button"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            title={isPlaying ? 'Pause' : 'Play'}
                            disabled={controlsDisabled}
                            onClick={togglePlayback}
                            className={`order-1 ${controlClassName}`}
                        >
                            {isPlaying ? 'Ⅱ' : '▶'}
                        </button>
                        <button
                            type="button"
                            aria-label="Stop"
                            title="Stop"
                            disabled={controlsDisabled}
                            onClick={() => playerRef.current?.stop()}
                            className={`order-1 ${controlClassName}`}
                        >
                            ■
                        </button>
                        <button
                            type="button"
                            aria-label="Next track"
                            title="Next track"
                            disabled={controlsDisabled}
                            onClick={() => playerRef.current?.nextTrack()}
                            className={`order-1 ${controlClassName}`}
                        >
                            |▶
                        </button>
                        <span
                            aria-hidden="true"
                            className="order-2 basis-full"
                        />
                    </div>
                    <label className="mt-2 flex w-full min-w-0 items-center gap-2 font-mono text-[9px] font-bold uppercase text-vt-amber">
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
                            className="h-1 min-w-0 flex-1 cursor-pointer accent-vt-orange disabled:cursor-not-allowed disabled:opacity-40"
                        />
                        <span className="text-right text-vt-green">
                            {volume}
                        </span>
                    </label>
                    <p className="mt-2 font-mono text-[9px] uppercase text-vt-green">
                        {popoutError
                            ? 'Allow pop-ups to detach Winamp'
                            : status === 'unsupported'
                              ? 'Browser unsupported'
                              : status === 'error'
                                ? 'Player failed to load'
                                : ''}
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
