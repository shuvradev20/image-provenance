"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Flame, Copy, CopyCheck, AlertTriangle, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifyStatus } from "./VerifyContainer";

// Amader existing components gulo direct import korchi (kono modification charai)
import AssetProofs from "@/components/sections/asset/AssetProofs";
import AssetTimeline from "@/components/sections/asset/AssetTimeline";

interface VerifyResultRightProps {
    status: VerifyStatus;
    resultData: any;
    onReset: () => void;
}

export default function VerifyResultRight({ status, resultData, onReset }: VerifyResultRightProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const asset = resultData?.asset;
    const uploadedFileDetails = resultData?.uploadedFileDetails;

    const handleCopy = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // ==========================================
    // SCENARIO C: UNREGISTERED ASSET
    // ==========================================
    if (status === 'unregistered') {
        return (
            <div className="flex flex-col gap-8 animate-in fade-in transition-all">
                {/* Header Section */}
                <div className="w-full pb-8 border-b border-border/20">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                    Unknown Asset
                                </h1>
                                <Badge variant="secondary" className="bg-destructive/10 text-destructive border-transparent py-1 px-3 pointer-events-none">
                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Unregistered
                                </Badge>
                            </div>
                            <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase block">
                                NO CATEGORY
                            </span>
                        </div>
                    </div>
                </div>

                {/* Technical Details Only */}
                <div className="w-full">
                    <div className="space-y-2 mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Technical Details</h3>
                        <hr className="border-border" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Format</span>
                            <span className="text-sm text-foreground uppercase">{uploadedFileDetails?.fileType || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">File Size</span>
                            <span className="text-sm text-foreground">
                                {uploadedFileDetails?.fileSize ? (uploadedFileDetails.fileSize / 1024 / 1024).toFixed(2) : '0.00'} MB
                            </span>
                        </div>
                    </div>
                </div>

                {/* Call To Action (Mint Image) */}
                <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <AlertTriangle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-foreground mb-1">Asset Not Protected</h4>
                        <p className="text-sm text-muted-foreground">
                            This image is not registered on the ProveNode blockchain. Are you the original creator? Secure your digital rights now.
                        </p>
                    </div>
                    <div className="flex gap-3 mt-2">
                        <Button variant="outline" onClick={onReset}>Scan Another</Button>
                        <Link href="/dashboard/mint">
                            <Button>Mint Image</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // SCENARIO A & B: AUTHENTIC OR EDITED
    // ==========================================
    if (!asset) return null;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in transition-all">
            
            {/* 1. Read-Only Header & Description (Based on your AssetDetails) */}
            <div className="w-full pb-8 border-b border-border/20">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground capitalize">
                                    {asset.title}
                                </h1>
                                {asset.status === 'burned' ? (
                                    <Badge variant="secondary" className="bg-destructive/10 text-destructive border-transparent py-1 px-3 pointer-events-none">
                                        <Flame className="w-3.5 h-3.5 mr-1.5" /> Burned
                                    </Badge>
                                ) : status === 'edited' ? (
                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-transparent py-1 px-3 pointer-events-none">
                                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Edited / Tampered
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-transparent py-1 px-3 pointer-events-none">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Authentic
                                    </Badge>
                                )}
                            </div>
                            <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase block">
                                {asset.assetCategory?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Description</h3>
                        <hr className="border-border" />
                        <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap mt-2">
                            {asset.description}
                        </p>
                    </div>

                    {asset.tags && asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {asset.tags.map((tag: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs font-normal text-foreground/60 bg-muted/10 px-3 py-1 border-border/50 rounded-full">
                                    {tag.trim()}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Read-Only Technical Details */}
            <div className="w-full">
                <div className="space-y-2 mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Technical Details</h3>
                    <hr className="border-border" />
                </div>
                {asset.fileDetails && (
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Resolution</span>
                            <span className="text-sm text-foreground">{asset.fileDetails.width} × {asset.fileDetails.height} px</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Format</span>
                            <span className="text-sm text-foreground uppercase">{asset.fileDetails.fileType}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Original File Size</span>
                            <span className="text-sm text-foreground">{(asset.fileDetails.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Read-Only Ownership (Based on your AssetOwnershipControls, NO transfer/burn buttons) */}
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 w-full">
                <div className="flex flex-col gap-5">
                    <div className="w-full">
                        <p className="text-sm text-muted-foreground mb-1">Minted By</p>
                        <div className="flex items-center gap-3 w-full">
                            <div className="min-w-0 flex-1">
                                <p className="font-mono text-[13px] text-foreground tracking-tight truncate">
                                    {asset.uploader || "0x0000000000000000000000000000000000000000"}
                                </p>
                            </div>
                            <button onClick={() => handleCopy(asset.uploader, 'uploader')} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
                                {copiedField === 'uploader' ? <CopyCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="w-full">
                        <p className="text-sm text-muted-foreground mb-1">Current Owner</p>
                        <div className="flex items-center gap-3 w-full">
                            <div className="min-w-0 flex-1">
                                <p className="font-mono text-[13px] text-foreground tracking-tight truncate">
                                    {asset.status === 'burned' ? "0x0000000000000000000000000000000000000000" : (asset.currentOwner || "0x0000000000000000000000000000000000000000")}
                                </p>
                            </div>
                            {asset.status === 'burned' ? (
                                <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-xs shrink-0 pointer-events-none">
                                    Burned Address
                                </Badge>
                            ) : (
                                <button onClick={() => handleCopy(asset.currentOwner, 'owner')} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
                                    {copiedField === 'owner' ? <CopyCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Digital Fingerprint Mismatch Alert (Only for Scenario B: Edited) */}
            {status === 'edited' && (
                <div className="w-full p-4 rounded-xl flex items-start gap-3 bg-red-50 text-red-600 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium leading-relaxed">
                        <strong>Hash Mismatch:</strong> The digital fingerprint of the uploaded file does not match the original asset on the blockchain. The file has been modified after it was registered.
                    </p>
                </div>
            )}

            {/* 5. Asset Proofs (Direct Reuse!) */}
            <AssetProofs asset={asset} />

            {/* 6. Asset Timeline (Direct Reuse!) */}
            {asset.history && asset.history.length > 0 && (
                <AssetTimeline history={asset.history} />
            )}

            {/* Bottom action to scan another file */}
            <div className="pt-4 flex justify-center border-t border-border/20">
                <Button variant="ghost" onClick={onReset} className="text-muted-foreground">
                    Scan Another Image
                </Button>
            </div>
            
        </div>
    );
}