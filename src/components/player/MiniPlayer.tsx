"use client";

import { usePlayer } from "@/context/PlayerContext";
import { X, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { getYouTubeEmbedUrl } from "@/lib/utils";

export function MiniPlayer() {
    const { currentVideo, isPlaying, togglePlay, closeVideo, maximize } = usePlayer();

    if (!currentVideo) return null;

    return (
        <motion.div
            className="flex items-center h-full px-3 gap-3 bg-neutral-900 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={maximize}
        >
            <div className="h-14 aspect-video bg-black rounded overflow-hidden relative">
                {currentVideo.mediaType === "YOUTUBE" ? (
                    <iframe
                        src={`${getYouTubeEmbedUrl(currentVideo.mediaUrl)}?controls=0&showinfo=0&autoplay=${isPlaying ? 1 : 0}&mute=1`} // mute for autoplay 
                        className="w-full h-full pointer-events-none"
                        title={currentVideo.title}
                    />
                ) : (
                    <video src={currentVideo.mediaUrl} className="w-full h-full object-cover" />
                )}
            </div>
            <div className="flex-1 min-w-0 cursor-pointer">
                <p className="text-white text-sm font-medium truncate">{currentVideo.title}</p>
                <p className="text-neutral-400 text-xs">Playing</p>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="p-2 text-white hover:bg-white/10 rounded-full"
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); closeVideo(); }}
                className="p-2 text-white hover:bg-white/10 rounded-full"
            >
                <X size={20} />
            </button>
        </motion.div>
    );
}
