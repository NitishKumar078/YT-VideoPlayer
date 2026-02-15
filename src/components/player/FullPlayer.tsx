"use client";

import React, { useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { Minimize2, SkipBack, SkipForward, Play, Pause, Maximize } from "lucide-react";

interface FullPlayerProps {
    toggleFullscreen: () => void;
    isFullscreen: boolean;
}

export function FullPlayer({ toggleFullscreen, isFullscreen }: FullPlayerProps) {
    const {
        currentVideo, isPlaying, togglePlay, closeVideo, minimize,
        nextVideo, prevVideo, hasNext, hasPrev, videoList, startVideo,
        currentTime, duration, seekTo
    } = usePlayer();

    // Gesture handling for "pull down to minimize" on the info section
    const touchStart = useRef<number>(0);
    const infoRef = useRef<HTMLDivElement>(null);

    // Double Tap State
    const lastTap = useRef<number>(0);
    const [showSkipForward, setShowSkipForward] = React.useState(false);
    const [showSkipBackward, setShowSkipBackward] = React.useState(false);

    // Controls Visibility State
    const [showControls, setShowControls] = React.useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isFullscreen && isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    // Effect to handle auto-hide when playing state or fullscreen changes
    React.useEffect(() => {
        resetControlsTimeout();
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isFullscreen, isPlaying]);

    const handleUserInteraction = () => {
        resetControlsTimeout();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
        handleUserInteraction();
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            // Double Tap Detected
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;

            if (x < width * 0.35) {
                // Left side - Rewind
                seekTo(Math.max(0, currentTime - 10));
                setShowSkipBackward(true);
                setTimeout(() => setShowSkipBackward(false), 500);
            } else if (x > width * 0.65) {
                // Right side - Skip
                seekTo(Math.min(duration, currentTime + 10));
                setShowSkipForward(true);
                setTimeout(() => setShowSkipForward(false), 500);
            } else {
                // Center double tap? Maybe toggle play/pause or maximize?
                // Standard behavior often implies toggle play/pause on single tap center.
                togglePlay();
            }
            lastTap.current = 0; // Reset
        } else {
            lastTap.current = now;
            // Handle single tap logic if needed (e.g., toggle controls visibility)
            if (isFullscreen) {
                setShowControls(prev => !prev);
            }
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        handleUserInteraction();
        const scrollTop = infoRef.current?.scrollTop || 0;
        if (scrollTop <= 0) {
            touchStart.current = e.touches[0].clientY;
        } else {
            touchStart.current = 0; // Disable if scrolled down
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleUserInteraction();
        if (touchStart.current === 0) return;

        const touchY = e.touches[0].clientY;
        const diff = touchY - touchStart.current;

        // If pulled down more than 100px while at top
        if (diff > 100) {
            minimize();
            touchStart.current = 0; // Reset
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleUserInteraction();
        const time = parseFloat(e.target.value);
        seekTo(time);
    };

    if (!currentVideo) return null;

    return (
        <div
            className="flex-1 flex flex-col h-full bg-transparent relative"
            onMouseMove={handleUserInteraction}
            onClick={handleUserInteraction}
        >
            {/* Top Controls Overlay */}
            <div
                className={cn(
                    "absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none transition-opacity duration-300",
                    !showControls && isFullscreen ? "opacity-0" : "opacity-100"
                )}
            >
                <button
                    onClick={minimize}
                    className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 active:scale-95 transition-all"
                >
                    <Minimize2 size={20} />
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 active:scale-95 transition-all"
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize size={20} />}
                </button>
            </div>

            {/* Main Video Area & Interactive Layer */}
            <div
                className="flex-1 flex items-center justify-center relative w-full h-[35vh] sm:h-[45vh] lg:h-[70vh] bg-transparent pointer-events-auto"
                onClick={handleVideoAreaClick}
            >
                {/* Visual Feedback for Double Tap */}
                {showSkipBackward && (
                    <div className="absolute left-10 text-white bg-black/50 p-4 rounded-full backdrop-blur pointer-events-none animate-in fade-in zoom-in duration-200">
                        <span className="font-bold">-10s</span>
                    </div>
                )}
                {showSkipForward && (
                    <div className="absolute right-10 text-white bg-black/50 p-4 rounded-full backdrop-blur pointer-events-none animate-in fade-in zoom-in duration-200">
                        <span className="font-bold">+10s</span>
                    </div>
                )}
            </div>

            {/* Video Info & Controls */}
            <div
                ref={infoRef}
                className={cn(
                    "bg-transparent lg:mt-80 mt-[-10em] p-2 pb-20 flex-1 overflow-y-auto rounded-t-2xl relative z-20 touch-pan-y shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-all duration-300",
                    isFullscreen && "fixed bottom-0 left-0 right-0 h-auto bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-8 flex-none rounded-none mt-0 overflow-visible shadow-none pointer-events-auto",
                    isFullscreen && !showControls ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
                )}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                {!isFullscreen && <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-6 cursor-pointer" onClick={minimize} />}

                {/* Timeline Scrubber */}
                <div className="mb-6 px-1">
                    <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium mb-2">
                        <span>{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="flex-1 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                            style={{
                                background: `linear-gradient(to right, white ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%)`
                            }}
                        />
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white mb-1 line-clamp-2 drop-shadow-lg shadow-black">{currentVideo.title}</h1>
                    </div>
                </div>


                {/* External Playback Controls */}
                <div className="flex justify-center items-center gap-8 py-6">
                    <button
                        onClick={prevVideo}
                        disabled={!hasPrev}
                        className={`text-white p-2 rounded-full transition-colors ${!hasPrev ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 active:bg-white/20'}`}
                    >
                        <SkipBack size={28} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="bg-white text-black p-4 rounded-full hover:scale-105 active:scale-95 transition-transform"
                    >
                        {isPlaying ? <Pause className="fill-current" size={32} /> : <Play className="fill-current" size={32} />}
                    </button>

                    <button
                        onClick={nextVideo}
                        disabled={!hasNext}
                        className={`text-white p-2 rounded-full transition-colors ${!hasNext ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 active:bg-white/20'}`}
                    >
                        <SkipForward size={28} />
                    </button>
                </div>

                {!isFullscreen && (
                    <div className="mt-4">
                        <h3 className="text-neutral-400 text-sm font-medium mb-3">Up Next</h3>
                        <div className="space-y-3">
                            {videoList.map((video, i) => (
                                <div
                                    key={video.slug}
                                    className={`flex gap-3 cursor-pointer p-2 rounded-lg transition-colors hover:bg-white/5 active:bg-white/10 ${currentVideo.slug === video.slug ? "bg-white/10" : ""}`}
                                    onClick={() => startVideo(video)}
                                >
                                    <div className="w-32 aspect-video bg-neutral-800 rounded-lg overflow-hidden relative">
                                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white text-sm font-medium line-clamp-2">{video.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center px-4 mt-2">
                    <div className="w-8"></div> {/* Spacer for balance if needed, or just let it be left aligned */}
                </div>
            </div>
        </div>
    );
}
