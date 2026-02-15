"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Video } from "@/types";
import { categories } from "@/lib/data";

interface PlayerContextType {
    currentVideo: Video | null;
    isPlaying: boolean;
    isMinimized: boolean;
    startVideo: (video: Video) => void;
    closeVideo: () => void;
    togglePlay: () => void;
    setIsPlaying: (playing: boolean) => void;
    minimize: () => void;
    maximize: () => void;
    toggleMinimize: () => void;
    nextVideo: () => void;
    prevVideo: () => void;
    hasNext: boolean;
    hasPrev: boolean;
    videoList: Video[];
    progress: Record<string, number>;
    saveProgress: (slug: string, time: number) => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
    duration: number;
    setDuration: (duration: number) => void;
    seekTo: (time: number) => void;
    seekRequest: { time: number; ts: number } | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Playback State
    const [progress, setProgress] = useState<Record<string, number>>({}); // slug -> seconds
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [seekRequest, setSeekRequest] = useState<{ time: number; ts: number } | null>(null);

    const saveProgress = useCallback((slug: string, time: number) => {
        setProgress(prev => ({ ...prev, [slug]: time }));
    }, []);

    const seekTo = useCallback((time: number) => {
        setSeekRequest({ time, ts: Date.now() });
        setCurrentTime(time); // Optimistic update
    }, []);

    const startVideo = (video: Video) => {
        if (currentVideo?.slug === video.slug) {
            // If clicking same video, just maximize it
            if (isMinimized) {
                setIsMinimized(false);
            }
            // Let it keep its playing state or ensure it plays?
            // Usually clicking an active video in a list implies "open/focus", ensuring play is good practice.
            setIsPlaying(true);
            return;
        }

        // New video
        setCurrentVideo(video);
        setIsPlaying(true);
        setIsMinimized(false);
        // Reset current time visuals until player updates
        setCurrentTime(progress[video.slug] || 0);
        setDuration(0);
        setSeekRequest(null);
    };

    const closeVideo = () => {
        setCurrentVideo(null);
        setIsPlaying(false);
        setIsMinimized(false);
    };

    const togglePlay = () => setIsPlaying((prev) => !prev);

    const minimize = () => setIsMinimized(true);
    const maximize = () => setIsMinimized(false);
    const toggleMinimize = () => setIsMinimized((prev) => !prev);

    // Helpers to find current list
    const getCurrentList = useCallback(() => {
        if (!currentVideo) return [];
        const category = categories.find(c => c.contents.some(v => v.slug === currentVideo.slug));
        return category ? category.contents : [];
    }, [currentVideo]);

    const currentIndex = getCurrentList().findIndex(v => v.slug === currentVideo?.slug);
    const videoList = getCurrentList();

    const hasNext = currentIndex !== -1 && currentIndex < videoList.length - 1;
    const hasPrev = currentIndex !== -1 && currentIndex > 0;

    const nextVideo = useCallback(() => {
        if (hasNext) {
            startVideo(videoList[currentIndex + 1]);
        }
    }, [hasNext, currentIndex, videoList]);

    const prevVideo = useCallback(() => {
        if (hasPrev) {
            startVideo(videoList[currentIndex - 1]);
        }
    }, [hasPrev, currentIndex, videoList]);

    return (
        <PlayerContext.Provider
            value={{
                currentVideo,
                isPlaying,
                isMinimized,
                startVideo,
                closeVideo,
                togglePlay,
                setIsPlaying,
                minimize,
                maximize,
                toggleMinimize,
                nextVideo,
                prevVideo,
                hasNext,
                hasPrev,
                videoList,
                progress,
                saveProgress,
                currentTime,
                setCurrentTime,
                duration,
                setDuration,
                seekTo,
                seekRequest
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}
