"use client";

import { useMintStore, MintStepType } from "@/store/useMintStore";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDashed, Loader2, AlertCircle, ArrowRight, XCircle} from "lucide-react";

export default function MintActionArea() {
    const router = useRouter();
    const { isMinting, isTrackerVisible, currentStep, progressPercent, mintError, mintedAssetHash } = useMintStore();
    const stepOrder = ['analyzing_image', 'injecting_dna', 'uploading_ipfs', 'awaiting_wallet', 'verifying_signature', 'minting_blockchain', 'syncing_database', 'success'];
    
    const renderStepIcon = (targetStep: MintStepType) => {
        const currentIdx = stepOrder.indexOf(currentStep);
        const targetIdx = stepOrder.indexOf(targetStep);

        if (mintError && currentStep === targetStep) {
            return <XCircle className="w-5 h-5 text-destructive shrink-0" />;
        }
        if (currentStep === 'success' || targetIdx < currentIdx) {
            return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        }
        if (currentStep === targetStep && isMinting) {
            return <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />;
        }
        return <CircleDashed className="w-5 h-5 text-muted-foreground shrink-0" />;
    };

    const getStepClass = (targetStep: MintStepType) => {
        const currentIdx = stepOrder.indexOf(currentStep);
        const targetIdx = stepOrder.indexOf(targetStep);

        if (currentStep === targetStep) return "text-foreground font-medium";
        if (targetIdx < currentIdx || currentStep === 'success') return "text-muted-foreground line-through decoration-foreground";
        return "text-muted-foreground";
    };

    return (
       <div className="w-full max-w-3xl mx-auto mt-8 mb-6 border-t border-border pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                <div className="w-full lg:w-[40%] flex flex-col space-y-4">
                    {currentStep === 'success' && mintedAssetHash ? (
                        <button
                            type="button"
                            onClick={() => router.push(`/dashboard/asset/${mintedAssetHash}`)}
                            className="w-full h-14 rounded-xl cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex flex-row items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                        >
                            View Registered asset
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            form="mint-asset-form"
                            disabled={isMinting}
                            className="relative w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold overflow-hidden transition-all active:scale-[0.98] disabled:opacity-90 disabled:pointer-events-none"
                        >
                            {isMinting && (
                                <div 
                                    className="absolute left-0 top-0 h-full bg-foreground/10 transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            )}
                            
                            <span className="relative z-10 w-full h-full flex flex-row items-center justify-center gap-2.5 cursor-pointer">
                                {isMinting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                                        Processing ({progressPercent}%)
                                    </>
                                ) : (
                                    "Mint & Register Asset"
                                )}
                            </span>
                        </button>
                    )}
                    
                    <p className="text-xs text-muted-foreground text-center lg:text-left">
                        * Network gas fees apply
                    </p>

                    {mintError && (
                        <div className="p-4 bg-destructive/10 h-auto border border-destructive/20 text-destructive rounded-xl flex items-start gap-3 mt-2 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p className="text-sm leading-relaxed">{mintError}</p>
                        </div>
                    )}
                </div>

                <div className="w-full lg:w-[55%]">
                    {isTrackerVisible && (
                        <div className="p-6 border-noneshadow-none space-y-5 animate-in fade-in duration-500">
                            <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase border-b border-border pb-2">
                                Minting Progress
                            </h3>
                            
                            <div className="flex flex-col space-y-4">
                                <div className={`flex items-start gap-3 text-sm transition-colors duration-300 ${getStepClass('analyzing_image')}`}>
                                    {renderStepIcon('analyzing_image')}
                                    <span className="mt-0.5">Scanning Image & Copyright Check</span>
                                </div>
                                <div className={`flex items-start gap-3 text-sm transition-colors duration-300 ${getStepClass('injecting_dna')}`}>
                                    {renderStepIcon('injecting_dna')}
                                    <span className="mt-0.5">Injecting Security DNA</span>
                                </div>
                                <div className={`flex items-start gap-3 text-sm transition-colors duration-300 ${getStepClass('uploading_ipfs')}`}>
                                    {renderStepIcon('uploading_ipfs')}
                                    <span className="mt-0.5">Uploading to Secure Storage</span>
                                </div>
                                <div className={`flex items-start gap-3 text-sm transition-colors duration-300 ${getStepClass('awaiting_wallet')}`}>
                                    {renderStepIcon('awaiting_wallet')}
                                    <span className="mt-0.5">Waiting for Wallet Approval</span>
                                </div>
                                <div className={`flex items-start gap-3 text-sm transition-colors duration-300 ${getStepClass('verifying_signature')}`}>
                                    {renderStepIcon('verifying_signature')}
                                    <span className="mt-0.5">Verifying Cryptographic Signature</span>
                                </div>
                                <div className={`flex items-start gap-3 text-sm transition-colors duration-300 ${getStepClass('minting_blockchain')}`}>
                                    {renderStepIcon('minting_blockchain')}
                                    <span className="mt-0.5">Registering on Blockchain</span>
                                </div>
                                <div className={`flex items-start gap-3 text-sm transition-colors duration-300 ${getStepClass('syncing_database')}`}>
                                    {renderStepIcon('syncing_database')}
                                    <span className="mt-0.5">Saving Final Record</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}