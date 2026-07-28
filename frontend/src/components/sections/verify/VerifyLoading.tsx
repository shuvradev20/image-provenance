"use client";

import { useState, useEffect } from "react";
import { ScanFace, Fingerprint, SearchCode, Loader2 } from "lucide-react";

interface VerifyLoadingProps {
    file: File | null;
}

const loadingSteps = [
    { text: "Scanning digital fingerprint...", icon: Fingerprint },
    { text: "Extracting ProveNode DNA...", icon: SearchCode },
    { text: "Cross-referencing blockchain records...", icon: ScanFace },
];

export default function VerifyLoading({ file }: VerifyLoadingProps) {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = loadingSteps[stepIndex].icon;

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-72px)] p-6 bg-background">
            <div className="flex flex-col items-center gap-8 animate-in fade-in duration-700">
                
                {/* Glowing Scanner Animation */}
                <div className="relative w-32 h-32 flex items-center justify-center rounded-2xl bg-muted/30 border border-border/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-[200%] animate-[scan_2s_ease-in-out_infinite]" />
                    <CurrentIcon className="w-12 h-12 text-primary relative z-10" />
                </div>

                <div className="space-y-3 text-center">
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        Analyzing Asset
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium animate-pulse">
                        {loadingSteps[stepIndex].text}
                    </p>
                </div>

            </div>
        </div>
    );
}