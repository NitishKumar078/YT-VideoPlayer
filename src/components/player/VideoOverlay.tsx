"use client";
import { usePlayer } from "@/context/PlayerContext";
import { motion, PanInfo } from "framer-motion";
import { X, Play, Pause } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import { FullPlayer } from "./FullPlayer";
import { YouTubePlayer } from "./YouTubePlayer";
import { NativeVideoPlayer } from "./NativeVideoPlayer";

export function VideoOverlay() {
    const { currentVideo, isMinimized, minimize, maximize, closeVideo, isPlaying, togglePlay } = usePlayer();

    useEffect(() => {
        if (currentVideo && !isMinimized) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [currentVideo, isMinimized]);

    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!isMinimized && info.offset.y > 100) {
            minimize();
        } else if (isMinimized && info.offset.y < -50) {
            maximize();
        }
    };

    const variants = {
        full: {
            y: 0,
            x: 0,
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            bottom: "auto",
            right: "auto",
            borderRadius: 0,
            opacity: 1,
            zIndex: 100,
        },
        mini: {
            y: 0,
            x: 0,
            width: "calc(100vw - 32px)",
            maxWidth: 320,
            height: 80,
            top: "auto",
            left: "auto",
            bottom: 24,
            right: 16,
            borderRadius: 12,
            opacity: 1,
            zIndex: 100,
        },
        hidden: { y: "100%", opacity: 0 }
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (!currentVideo) return null;

    return (
        <motion.div
            ref={containerRef}
            drag={isMinimized ? "y" : false} // Drag only enabled in mini mode (swipe to dismiss could be added here later)
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            variants={variants}
            initial="hidden"
            animate={isMinimized ? "mini" : "full"}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bg-neutral-900 shadow-2xl overflow-hidden flex flex-col"
            style={{ touchAction: "none" }}
        >
            {/* 
                PERSISTENT VIDEO LAYER
                This layer sits behind the UI and resizes/moves based on state.
                Actually, to keep it persistent, we just render it here always.
                The visual layout (mini vs full) is handled by the container's size.
                We need to adjust internal layout of video vs controls.
             */}

            <div className={cn(
                "absolute transition-all duration-300 ease-in-out bg-black",
                isMinimized
                    ? "left-0 top-0 bottom-0 w-[120px]" // Mini player video size
                    : isFullscreen ? "inset-0 h-full w-full" : "inset-0 h-[35vh] sm:h-[45vh] lg:h-[70vh] w-full" // Full player video size
            )}>
                {/* Render BOTH, they will handle their own "active" state or null return internally based on mediaType */}
                <div className="w-full h-full relative pointer-events-none"> {/* Disable pointer events so clicks go to overlay/gestures, OR enable specific controls */}
                    <YouTubePlayer />
                    <NativeVideoPlayer />
                </div>
            </div>


            {/* UI LAYER - Controls & Info */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
                {/* Mini Player Controls (Visible only when minimized) */}
                <div className={cn(
                    "flex items-center justify-between p-3 gap-3 h-full cursor-default pointer-events-auto bg-transparent",
                    isMinimized ? "opacity-100" : "opacity-0 pointer-events-none hidden"
                )} onClick={maximize}>
                    <div className="w-[120px]" /> {/* Spacer for video */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-white text-sm font-medium truncate">{currentVideo.title}</p>
                        <p className="text-neutral-400 text-xs">Playing</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-2 text-white hover:bg-white/10 rounded-full">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); closeVideo(); }} className="p-2 text-white hover:bg-white/10 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Full Player Controls (Visible only when maximized) */}
                <div className={cn(
                    "flex-1 w-full h-full pointer-events-auto",
                    !isMinimized ? "opacity-100" : "opacity-0 pointer-events-none"
                )}>
                    <FullPlayer toggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} />
                </div>
            </div>
        </motion.div>
    );
}
