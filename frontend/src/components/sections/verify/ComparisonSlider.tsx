"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ComparisonSliderProps {
    originalSrc: string;
    uploadedSrc: string;
}

export default function ComparisonSlider({ originalSrc, uploadedSrc }: ComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSliderPosition(Number(e.target.value));
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full max-h-full flex items-center justify-center rounded-xl overflow-hidden select-none"
        >
            {/* Base Image (Uploaded / Edited) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Image
                    src={uploadedSrc}
                    alt="Uploaded Image"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                />
            </div>

            {/* Top Image (Original) bounded by clip-path */}
            <div 
                className="absolute inset-0 flex items-center justify-center border-r-[3px] border-primary"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <Image
                    src={originalSrc}
                    alt="Original Image"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                />
                {/* Tag for Original Side */}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur text-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-md z-10">
                    Original
                </div>
            </div>

            {/* Tag for Uploaded Side */}
            <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md z-10">
                Uploaded
            </div>

            {/* Invisible Range Input for sliding */}
            <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            {/* Custom Slider Handle */}
            <div 
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center z-10 pointer-events-none transition-transform"
                style={{ left: `calc(${sliderPosition}% - 16px)` }}
            >
                <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-primary-foreground rounded-full" />
                    <div className="w-0.5 h-3 bg-primary-foreground rounded-full" />
                </div>
            </div>
        </div>
    );
}