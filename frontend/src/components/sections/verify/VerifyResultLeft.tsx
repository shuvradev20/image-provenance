"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { VerifyStatus } from "./VerifyContainer";
import ComparisonSlider from "./ComparisonSlider";

interface VerifyResultLeftProps {
    status: VerifyStatus;
    file: File | null;
    resultData: any;
}

export default function VerifyResultLeft({ status, file, resultData }: VerifyResultLeftProps) {
    const [uploadedImgUrl, setUploadedImgUrl] = useState<string>("");

    // Create object URL from the uploaded file for preview
    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setUploadedImgUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    // Banner Configuration based on Status
    const getBannerConfig = () => {
        switch (status) {
            case 'authentic':
                return {
                    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                    icon: <CheckCircle2 className="w-5 h-5" />,
                    title: "Verified Authentic",
                    desc: "This asset is completely original and protected by ProveNode."
                };
            case 'edited':
                return {
                    color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-500",
                    icon: <AlertTriangle className="w-5 h-5" />,
                    title: "Modifications Detected",
                    desc: "ProveNode DNA found, but the file hash does not match the original."
                };
            case 'unregistered':
                return {
                    color: "bg-destructive/10 border-destructive/20 text-destructive",
                    icon: <XCircle className="w-5 h-5" />,
                    title: "Unregistered Asset",
                    desc: "No ProveNode protection found for this asset."
                };
            default:
                return null;
        }
    };

    const banner = getBannerConfig();

    return (
        <div className="w-full h-full flex flex-col items-center justify-start gap-4">
            
            {/* The Verdict Banner */}
            {banner && (
                <div className={`w-full p-4 rounded-xl border flex items-start gap-3 ${banner.color}`}>
                    <div className="shrink-0 mt-0.5">{banner.icon}</div>
                    <div>
                        <h3 className="font-semibold text-base leading-none mb-1.5">{banner.title}</h3>
                        <p className="text-sm opacity-90">{banner.desc}</p>
                    </div>
                </div>
            )}

            {/* The Image Area Workspace */}
            <div className="w-full flex-1 relative rounded-xl overflow-hidden bg-background/50 border border-border flex items-center justify-center min-h-[300px]">
                
                {status === 'edited' && resultData?.asset?.thumbnailUrl ? (
                    /* Scenario B: Show Slider comparing Original (from DB) vs Uploaded (from local File) */
                    <ComparisonSlider 
                        originalSrc={resultData.asset.thumbnailUrl} 
                        uploadedSrc={uploadedImgUrl} 
                    />
                ) : (
                    /* Scenario A & C: Show single uploaded image */
                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                        {uploadedImgUrl && (
                            <Image
                                src={uploadedImgUrl}
                                alt="Verified Asset"
                                fill
                                className="object-contain p-2"
                                sizes="(max-width: 1024px) 100vw, 55vw"
                                priority
                            />
                        )}
                    </div>
                )}
                
            </div>
        </div>
    );
}