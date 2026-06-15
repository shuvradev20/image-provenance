"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface LightboxProps {
    src: string | null;
    alt?: string;
    onClose: () => void;
}

export function Lightbox({ src, alt = "Image preview", onClose }: LightboxProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (src) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [src]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && src) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [src, onClose]);

    if (!mounted || !src) return null;

    return createPortal(
        <div 
            // EKANE 'pointer-events-auto' ADD KORA HOYECHE JATE CLICK KAJ KORE
            className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center animate-in fade-in duration-200 pointer-events-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Image Container */}
            <div 
                className="relative flex items-center justify-center w-full h-full p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <img 
                    src={src} 
                    alt={alt} 
                    className="object-contain max-w-full max-h-full drop-shadow-2xl"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>

            {/* Close Button */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }} 
                className="absolute top-4 right-4 md:top-6 md:right-6 p-3 text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer z-[1000000]" 
                title="Close"
            >
                <X className="w-6 h-6" />
            </button>
        </div>,
        document.body
    );
}