"use client";

import { useState } from "react";
import { Copy, CopyCheck, ExternalLink } from "lucide-react";

interface AssetProofsProps {
    asset: any;
}

export default function AssetProofs({ asset }: AssetProofsProps) {
    const [copied, setCopied] = useState(false);
    console.log(asset)
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 w-full">
            <div className="flex flex-col gap-6">
                <div className="w-full">
                    <p className="text-sm text-muted-foreground mb-1">Digital Fingerprint</p>
                    <div className="flex items-center gap-3 rounded-lg w-full">
                        <div className="min-w-0 flex-1">
                            <p className="font-mono text-[13px] text-foreground tracking-tight truncate">
                                {asset.imageHash || "N/A"}
                            </p>
                        </div>
                        <button onClick={() => handleCopy(asset.imageHash)} className="text-muted-foreground hover:text-foreground shrink-0">
                            {copied ? <CopyCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="w-full border-t border-border pt-6">
                    <p className="text-sm text-muted-foreground mb-3">Decentralized Storage (IPFS)</p>
                    <div className="flex flex-row gap-3">
                        <a 
                            href={asset.downloadUrl || `#` } 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2.5 bg-muted/50 hover:bg-muted border border-border px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm text-foreground transition-all flex-1"
                        >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            Original Image
                        </a>
                        <a 
                            href={asset.metadataLink || `#`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2.5 bg-muted/50 hover:bg-muted border border-border px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm text-foreground transition-all flex-1"
                        >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            Metadata JSON
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}