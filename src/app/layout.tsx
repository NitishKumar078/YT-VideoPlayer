import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import { VideoOverlay } from "@/components/player/VideoOverlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Video Player App",
    description: "A mobile-first video player experience",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <PlayerProvider>
                    {children}
                    <VideoOverlay />
                </PlayerProvider>
            </body>
        </html>
    );
}
