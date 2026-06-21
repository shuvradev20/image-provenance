"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

interface AssetProofsProps {
    asset: any;
}

export default function AssetProofs({ asset }: AssetProofsProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm w-full">
            <h3 className="text-lg font-semibold mb-6 tracking-tight text-foreground">Web3 Proofs</h3>
            
            <div className="flex flex-col gap-6">
                
                {/* Digital Fingerprint (Matching the Minted By design) */}
                <div className="w-full">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Digital Fingerprint</p>
                    <div className="flex items-center gap-3 rounded-lg w-full">
                        <div className="min-w-0 flex-1">
                            <p className="font-mono text-[14px] text-foreground truncate">
                                {asset.imageHash || "N/A"}
                            </p>
                        </div>
                        <button onClick={() => handleCopy(asset.imageHash)} className="text-muted-foreground hover:text-foreground shrink-0">
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* IPFS Storage Links (Converted to premium clickable blocks) */}
                <div className="w-full border-t border-border/40 pt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Decentralized Storage (IPFS)</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a 
                            href={asset.downloadUrl || `https://gateway.pinata.cloud/ipfs/${asset.imageCID}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2.5 bg-background hover:bg-muted/50 border border-border/50 px-4 py-2.5 rounded-xl text-[14px] font-medium text-foreground transition-all flex-1 shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            Original Image
                        </a>
                        <a 
                            href={`https://gateway.pinata.cloud/ipfs/${asset.metadataCID}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2.5 bg-background hover:bg-muted/50 border border-border/50 px-4 py-2.5 rounded-xl text-[14px] font-medium text-foreground transition-all flex-1 shadow-sm"
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