"use client";

import { useState, useRef } from "react";
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

  const originalOpacity = Math.min(1, sliderPosition / 15);
  const uploadedOpacity = Math.min(1, (100 - sliderPosition) / 15);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full max-h-full flex items-center justify-center rounded-lg overflow-hidden select-none"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {uploadedSrc ? (
          <Image
            src={uploadedSrc}
            alt="Uploaded Modified Image"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        ) : null}
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {originalSrc ? (
          <Image
            src={originalSrc}
            alt="Original Blockchain Record"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        ) : null}
      </div>
      <div 
        className="absolute top-3 left-3 text-primary text-[10px] font-mono tracking-wider z-10 transition-opacity"
        style={{ 
          opacity: originalOpacity,
          pointerEvents: originalOpacity === 0 ? "none" : "auto" 
        }}
      >
        ORIGINAL
      </div>

      <div 
        className="absolute top-3 right-3 text-primary text-[10px] font-mono tracking-wider z-10 transition-opacity"
        style={{ 
          opacity: uploadedOpacity,
          pointerEvents: uploadedOpacity === 0 ? "none" : "auto" 
        }}
      >
        UPLOADED
      </div>

      <div 
        className="absolute top-0 bottom-0 w-[1.5px] bg-white z-10 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      />
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        title="Slide to compare original vs uploaded file"
      />

      <div 
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white text-zinc-900 rounded-full shadow-lg flex items-center justify-center z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="flex items-center justify-center gap-0.5 text-[8px] font-bold select-none">
          <span>&#9664;</span>
          <span>&#9654;</span>
        </div>
      </div>
    </div>
  );
}