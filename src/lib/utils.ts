import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function getYouTubeId(url: string) {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getYouTubeEmbedUrl(url: string) {
    try {
        if (!url) return "";

        let videoId = "";

        if (url.includes("youtube.com/watch")) {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get("v") || "";
        } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
        } else if (url.includes("youtube.com/embed/")) {
            videoId = url.split("embed/")[1]?.split("?")[0] || "";
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url;
    } catch (e) {
        return url;
    }
}

export function formatDuration(seconds: number) {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());
    if (hh) {
        return `${hh}:${pad(mm)}:${ss}`;
    }
    return `${mm}:${ss}`;
}

function pad(string: number) {
    return ('0' + string).slice(-2);
}
