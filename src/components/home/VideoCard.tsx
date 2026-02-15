"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Video } from "@/types";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoCardProps {
    video: Video;
    categoryName?: string;
}

export function VideoCard({ video, categoryName }: VideoCardProps) {
    const { startVideo } = usePlayer();

    return (
        <div
            className="flex flex-col gap-2 cursor-pointer group"
            onClick={() => startVideo(video)}
        >
            <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-800 border border-white/10">
                <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <Play className="w-12 h-12 text-white fill-white" />
                </div>
                {video.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {video.duration}
                    </div>
                )}
            </div>
            <div className="flex gap-3 px-1">
                <div className="flex flex-col">
                    <h3 className="text-white font-medium line-clamp-2 leading-tight">
                        {video.title}
                    </h3>
                    <p className="text-neutral-400 text-sm mt-1">
                        {categoryName || "Video"}
                    </p>
                </div>
            </div>
        </div>
    );
}
