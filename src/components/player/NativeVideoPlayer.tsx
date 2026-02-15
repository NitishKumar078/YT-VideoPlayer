
"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";

export function NativeVideoPlayer() {
    const { currentVideo, isPlaying, setIsPlaying, saveProgress, progress, setCurrentTime, setDuration, seekRequest } = usePlayer();
    const videoRef = useRef<HTMLVideoElement>(null);
    const slugRef = useRef<string | null>(null);

    // Sync Source & Progress
    useEffect(() => {
        if (!currentVideo || currentVideo.mediaType === "YOUTUBE" || !videoRef.current) return;

        // If source changed
        if (slugRef.current !== currentVideo.slug) {
            videoRef.current.src = currentVideo.mediaUrl;
            videoRef.current.load();
            slugRef.current = currentVideo.slug;

            // Restore progress
            const savedTime = progress[currentVideo.slug];
            if (savedTime) {
                videoRef.current.currentTime = savedTime;
            }
        }

    }, [currentVideo, progress]);

    // Sync Seek
    useEffect(() => {
        if (seekRequest && videoRef.current) {
            videoRef.current.currentTime = seekRequest.time;
        }
    }, [seekRequest]);

    // Sync Play/Pause
    useEffect(() => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.play().catch(e => console.error("Play failed", e));
        } else {
            videoRef.current.pause();
        }
    }, [isPlaying]);

    const handleTimeUpdate = () => {
        if (videoRef.current && currentVideo) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);
            saveProgress(currentVideo.slug, time);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    if (!currentVideo || currentVideo.mediaType === "YOUTUBE") return null;

    return (
        <video
            ref={videoRef}
            className="w-full h-full object-contain bg-black"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handlePlay}
            onPause={handlePause}

            // We control play state manually via effect, but 'controls' prop might interfere slightly if user uses native controls.
            // But user asked for custom controls? 
            // FullPlayer has customized controls. So we hide native controls?
            // "CustomVideoPlayer" had native controls hidden usually.
            // Let's hide controls and let `FullPlayer` overlay handle it.
            // BUT: MiniPlayer relies on this video.
            // Use 'playsInline' for mobile.
            playsInline
        />
    );
}
