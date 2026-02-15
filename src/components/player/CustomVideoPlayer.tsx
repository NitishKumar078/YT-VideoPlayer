"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface CustomVideoPlayerProps {
    url: string;
    isActive: boolean;
    onTogglePlay: () => void;
    onSwitchToDefault: () => void;
}

export function CustomVideoPlayer({ url, isActive, onTogglePlay, onSwitchToDefault }: CustomVideoPlayerProps) {
    // Workaround for react-player v3 type incompatibility
    const ReactPlayerAny = ReactPlayer as any;
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

    // Gestures state
    const lastTapRef = useRef<number>(0);

    // Show/Hide controls logic
    const resetControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeout) clearTimeout(controlsTimeout);
        if (isActive) {
            const timeout = setTimeout(() => {
                setShowControls(false);
            }, 3000);
            setControlsTimeout(timeout);
        }
    };

    useEffect(() => {
        setHasError(false); // Reset error on url change
        setIsReady(false);
    }, [url]);

    useEffect(() => {
        resetControlsTimeout();
        return () => {
            if (controlsTimeout) clearTimeout(controlsTimeout);
        };
    }, [isActive]);

    const handleMouseMove = () => {
        resetControlsTimeout();
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setMuted(newVolume === 0);
    };

    const handleToggleMute = () => {
        setMuted(!muted);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayed(parseFloat(e.target.value));
        setSeeking(true);
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
        setSeeking(false);
        if (playerRef.current) {
            playerRef.current.seekTo(parseFloat((e.target as HTMLInputElement).value));
        }
    };

    const handleProgress = (state: { played: number; loaded: number; loadedSeconds: number; playedSeconds: number }) => {
        if (!seeking) {
            setPlayed(state.played);
        }
    };

    const handleDuration = (duration: number) => {
        setDuration(duration);
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Double tap detected
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                const x = e.clientX - rect.left;
                if (x < rect.width / 3) {
                    // Rewind 10s
                    if (playerRef.current) playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
                } else if (x > (rect.width * 2) / 3) {
                    // Forward 10s
                    if (playerRef.current) playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
                } else {
                    // Center double tap (toggle play/pause)
                    onTogglePlay();
                }
            }
        } else {
            // Single tap behavior
            if (showControls && isActive) {
                setShowControls(false);
            } else {
                setShowControls(true);
            }
        }
        lastTapRef.current = now;
    };


    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onClick={handleContainerClick}
        >
            <ReactPlayerAny
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                playing={isActive}
                volume={volume}
                muted={muted}
                onProgress={handleProgress as any}
                onDuration={handleDuration}
                onReady={() => setIsReady(true)}
                onError={() => {
                    console.error("Video Load Error");
                    setHasError(true);
                }}
                config={{
                    youtube: {
                        playerVars: { showinfo: 0, controls: 0, modestbranding: 1, rel: 0, disablekb: 1, fs: 0 }
                    } as any
                }}
                style={{ position: 'absolute', top: 0, left: 0 }}
            />

            {/* Error Overlay */}
            {hasError && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 text-center">
                    <p className="text-red-500 mb-2 font-medium">Video failed to load</p>
                    <p className="text-gray-400 text-sm mb-4">You can try switching to the default player.</p>
                    <button
                        onClick={(e) => { e.stopPropagation(); onSwitchToDefault(); }}
                        className="px-4 py-2 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                        Switch to Default Player
                    </button>
                </div>
            )}

            {/* Loading Spinner */}
            {!isReady && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
            )}

            {/* Gesture Overlay - Captures clicks over iframe */}
            <div
                className="absolute inset-0 z-10"
                onClick={handleContainerClick}
            />

            {/* Overlay Controls */}
            {!hasError && (
                <div
                    className={`absolute inset-0 bg-black/40 flex flex-col justify-between transition-opacity duration-300 z-20 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >

                    {/* Top Overlay */}
                    <div className="p-4 bg-gradient-to-b from-black/60 to-transparent"></div>

                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {!isActive && (
                            <div className="bg-black/50 p-4 rounded-full backdrop-blur-sm pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}>
                                <Play className="text-white w-8 h-8 fill-current ml-1" />
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="p-4 bg-gradient-to-t from-black/80 to-transparent space-y-2 pointer-events-auto" onClick={e => e.stopPropagation()}>
                        {/* Progress Bar */}
                        <input
                            type="range"
                            min={0}
                            max={0.999999}
                            step="any"
                            value={played}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekMouseUp}
                            onTouchEnd={handleSeekMouseUp}
                            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-1.5 transition-all"
                        />

                        <div className="flex justify-between items-center text-white">
                            <div className="flex items-center gap-4">
                                <button onClick={onTogglePlay} className="hover:text-red-500 transition-colors">
                                    {isActive ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
                                </button>

                                <div className="flex items-center gap-2 group/vol">
                                    <button onClick={handleToggleMute} className="hover:text-gray-300">
                                        {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step="any"
                                        value={muted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white hidden group-hover/vol:block"
                                    />
                                </div>

                                <span className="text-xs font-medium text-gray-300">
                                    {formatDuration(duration * played)} / {formatDuration(duration)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
