
"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { getYouTubeId } from "@/lib/utils";

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export function YouTubePlayer() {
    const { currentVideo, isPlaying, setIsPlaying, saveProgress, progress, setCurrentTime, setDuration, seekRequest } = usePlayer();
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentVideoIdRef = useRef<string | null>(null);

    // Load YouTube API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                // API Ready, but we wait for video effect to create player
            };
        }
    }, []);

    // Initialize or Update Player
    useEffect(() => {
        if (!currentVideo || currentVideo.mediaType !== "YOUTUBE") return;

        const videoId = getYouTubeId(currentVideo.mediaUrl);
        if (!videoId) return;

        // Helper to sync state
        const onPlayerStateChange = (event: any) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (event.data === 1) {
                setIsPlaying(true);
                setDuration(playerRef.current?.getDuration() || 0);
            } else if (event.data === 2) {
                setIsPlaying(false);
            } else if (event.data === 0) {
                setIsPlaying(false);
            }
        };

        if (!playerRef.current) {
            // Create Player
            // We need to wait for window.YT
            const interval = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(interval);
                    playerRef.current = new window.YT.Player(containerRef.current, {
                        height: '100%',
                        width: '100%',
                        videoId: videoId,
                        playerVars: {
                            autoplay: isPlaying ? 1 : 0,
                            controls: 0,
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                            disablekb: 1,
                            fs: 0
                        },
                        events: {
                            onReady: (event: any) => {
                                // Seek to saved progress
                                const savedTime = progress[currentVideo.slug];
                                if (savedTime) {
                                    event.target.seekTo(savedTime);
                                }
                                if (isPlaying) {
                                    event.target.playVideo();
                                }
                                setDuration(event.target.getDuration());
                            },
                            onStateChange: onPlayerStateChange
                        }
                    });
                    currentVideoIdRef.current = videoId;
                }
            }, 100);
            return () => clearInterval(interval);
        } else {
            // Update existing player if video changed
            if (currentVideoIdRef.current !== videoId) {
                playerRef.current.loadVideoById(videoId);
                currentVideoIdRef.current = videoId;
                // Seek to saved progress for new video
                const savedTime = progress[currentVideo.slug];
                if (savedTime) {
                    playerRef.current.seekTo(savedTime);
                }
            }
        }
    }, [currentVideo, progress]); // Intentionally omitting isPlaying to avoid re-creation

    // Handle Seek Request
    useEffect(() => {
        if (seekRequest && playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(seekRequest.time, true);
        }
    }, [seekRequest]);

    // Handle Play/Pause props
    useEffect(() => {
        if (playerRef.current && playerRef.current.getPlayerState) {
            const playerState = playerRef.current.getPlayerState();
            // 1 = playing, 2 = paused
            if (isPlaying && playerState !== 1 && playerState !== 3) { // 3 is buffering
                playerRef.current.playVideo();
            } else if (!isPlaying && playerState === 1) {
                playerRef.current.pauseVideo();
            }
        }
    }, [isPlaying]);

    // Track Progress
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime && isPlaying) {
                const time = playerRef.current.getCurrentTime();
                if (currentVideo) {
                    // Only save if meaningful change or periodic?
                    // Storing in context might re-render too much? 
                    // Context updates are fine if memoized components, but let's be careful.
                    // We update 'currentTime' for UI, and 'progress' map.
                    setCurrentTime(time);
                    saveProgress(currentVideo.slug, time);
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying, currentVideo, saveProgress, setCurrentTime]);

    // Cleanup? Not really, we want persistence. But if we unmount completely...
    // The layout strategy keeps this component mounted.

    // However, we need a div to mount into
    return <div ref={containerRef} className="w-full h-full" />;
}
