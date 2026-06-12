"use client";

import { useMintStore, MintStepType } from "@/store/useMintStore";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDashed, Loader2, AlertCircle, ArrowRight } from "lucide-react";

export default function MintActionArea() {
    const router = useRouter();
    const { 
        isMinting, 
        isTrackerVisible, 
        currentStep, 
        progressPercent, 
        mintError, 
        mintedAssetHash 
    } = useMintStore();

    // Helper function to render step icon states
    const renderStepIcon = (stepName: MintStepType, targetStep: MintStepType, index: number) => {
        const stepOrder: MintStepType[] = ['ipfs_watermark', 'signature', 'blockchain', 'database', 'success'];
        const currentIdx = stepOrder.indexOf(currentStep);
        const targetIdx = stepOrder.indexOf(targetStep);

        if (currentStep === 'success' || targetIdx < currentIdx) {
            return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        }
        if (currentStep === targetStep && isMinting) {
            return <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />;
        }
        return <CircleDashed className="w-5 h-5 text-muted-foreground/60 shrink-0" />;
    };

    const getStepClass = (targetStep: MintStepType) => {
        const stepOrder: MintStepType[] = ['ipfs_watermark', 'signature', 'blockchain', 'database', 'success'];
        const currentIdx = stepOrder.indexOf(currentStep);
        const targetIdx = stepOrder.indexOf(targetStep);

        if (currentStep === targetStep) return "text-foreground font-medium";
        if (targetIdx < currentIdx || currentStep === 'success') return "text-muted-foreground/80 line-through decoration-emerald-500/30";
        return "text-muted-foreground/50";
    };

    return (
        <div className="w-full mt-8 border-t border-border pt-6">
            {/* Mobile e flex-col (upor-niche), Desktop e lg:flex-row (pashapashi) layout */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                
                {/* ========================================= */}
                {/* BLOCK 6: Dynamic Magic Button & Info      */}
                {/* ========================================= */}
                <div className="w-full lg:w-[35%] flex flex-col space-y-3">
                    {currentStep === 'success' && mintedAssetHash ? (
                        <button
                            type="button"
                            onClick={() => router.push(`/dashboard/asset/${mintedAssetHash}`)}
                            className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                        >
                            ✨ View Certificate of Authenticity
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            form="mint-asset-form"
                            disabled={isMinting}
                            className="relative w-full h-14 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold overflow-hidden shadow-md transition-all active:scale-[0.98] disabled:opacity-90 disabled:pointer-events-none"
                        >
                            {/* Live Active Progress Bar inside the Button */}
                            {isMinting && (
                                <div 
                                    className="absolute left-0 top-0 h-full bg-foreground/10 transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            )}
                            
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isMinting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing Provenance ({progressPercent}%)
                                    </>
                                ) : (
                                    "Mint & Register Asset"
                                )}
                            </span>
                        </button>
                    )}
                    
                    <p className="text-xs text-muted-foreground text-center lg:text-left">
                        * User strictly pays their own gas fees via connected wallet ledger context.
                    </p>

                    {/* Error Display Card */}
                    {mintError && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium leading-relaxed">{mintError}</p>
                        </div>
                    )}
                </div>

                {/* ========================================= */}
                {/* BLOCK 7: The Reveal Tracker Checklist     */}
                {/* ========================================= */}
                <div className="w-full lg:w-[60%]">
                    {isTrackerVisible && (
                        <div className="p-5 bg-card border border-border rounded-xl shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 lg:slide-in-from-right-4">
                            <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase border-b border-border pb-2">
                                Provenance Tracking Pipeline
                            </h3>
                            
                            <div className="flex flex-col space-y-3">
                                {/* Step 1 */}
                                <div className={`flex items-center gap-3 text-sm ${getStepClass('ipfs_watermark')}`}>
                                    {renderStepIcon(currentStep, 'ipfs_watermark', 1)}
                                    <span>Injecting Invisible DNA Watermark & Saving to IPFS</span>
                                </div>

                                {/* Step 2 */}
                                <div className={`flex items-center gap-3 text-sm ${getStepClass('signature')}`}>
                                    {renderStepIcon(currentStep, 'signature', 2)}
                                    <span>Awaiting Ownership Cryptographic Signature (MetaMask Sign)</span>
                                </div>

                                {/* Step 3 */}
                                <div className={`flex items-center gap-3 text-sm ${getStepClass('blockchain')}`}>
                                    {renderStepIcon(currentStep, 'blockchain', 3)}
                                    <span>Publishing Provenance Ledger Entry on Arbitrum Chain</span>
                                </div>

                                {/* Step 4 */}
                                <div className={`flex items-center gap-3 text-sm ${getStepClass('database')}`}>
                                    {renderStepIcon(currentStep, 'database', 4)}
                                    <span>Synchronizing Secure Asset Data Models with MongoDB Layer</span>
                                </div>

                                {/* Step 5 */}
                                <div className={`flex items-center gap-3 text-sm ${getStepClass('success')}`}>
                                    {renderStepIcon(currentStep, 'success', 5)}
                                    <span className={currentStep === 'success' ? "text-emerald-500 font-semibold" : ""}>
                                        Asset Identity Registered Successfully!
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}