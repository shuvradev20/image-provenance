"use client";

import Image from "next/image";
import { Flame } from "lucide-react";

interface AssetImageProps {
    thumbnailUrl: string;
    title: string;
    status: string;
}

export default function AssetImage({ thumbnailUrl, title, status }: AssetImageProps) {
    const isBurned = status === 'burned';

    return (
        <div className="relative group w-full h-[60vh] lg:h-[80vh] flex items-center justify-center">
            
            {/* The Burned Overlay (The Tombstone Effect) */}
            {isBurned && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-md rounded-2xl transition-all duration-500">
                    <div className="border-4 border-destructive/80 text-destructive px-6 py-3 md:px-8 md:py-4 rounded-xl -rotate-12 shadow-2xl bg-background/40 backdrop-blur-sm transform hover:scale-105 transition-transform">
                        <h2 className="text-3xl md:text-5xl font-black tracking-[0.2em] uppercase flex items-center gap-3 drop-shadow-md">
                            <Flame className="w-8 h-8 md:w-12 md:h-12 animate-pulse" />
                            Burned
                        </h2>
                    </div>
                </div>
            )}

            {/* Image Container */}
            <div className="relative w-full h-full p-4 flex items-center justify-center">
                <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    className={`object-contain transition-transform duration-700 ease-in-out ${
                        isBurned ? 'grayscale opacity-30 blur-sm pointer-events-none' : 'hover:scale-[1.03]'
                    }`}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    priority
                />
            </div>
        </div>
    );
}