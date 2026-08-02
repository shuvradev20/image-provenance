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
            return <XCircle className="w-4 h-4 mt-0.5 text-status-error shrink-0" />;
        }
        if (currentStep === 'success' || targetIdx < currentIdx) {
            return <CheckCircle2 className="w-4 h-4 mt-0.5 text-status-success shrink-0" />;
        }
        if (currentStep === targetStep && isMinting) {
            return <Loader2 className="w-4 h-4 mt-0.5 text-primary animate-spin shrink-0" />;
        }
        return <CircleDashed className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />;
    };

    const getStepClass = (targetStep: MintStepType) => {
        const currentIdx = stepOrder.indexOf(currentStep);
        const targetIdx = stepOrder.indexOf(targetStep);

        if (currentStep === targetStep) return "text-foreground font-medium";
        if (targetIdx < currentIdx || currentStep === 'success') return "text-muted-foreground line-through decoration-muted-foreground/60";
        return "text-muted-foreground/70";
    };

    return (
       <div className="w-full max-w-3xl mx-auto mt-8 mb-2 border-t border-border pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                <div className="w-full lg:w-[40%] flex flex-col space-y-4">
                    {currentStep === 'success' && mintedAssetHash ? (
                        <button
                            type="button"
                            title="View newly registered asset details"
                            onClick={() => router.push(`/dashboard/asset/${mintedAssetHash}`)}
                            className="w-full h-12 rounded-xl cursor-pointer bg-primary text-primary-foreground font-medium text-sm flex flex-row items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                        >
                            View Registered asset
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            form="mint-asset-form"
                            disabled={isMinting}
                            title={isMinting ? `Minting in progress (${progressPercent}%)` : "Click to mint and register digital asset"}
                            className="relative w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm overflow-hidden transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-80 disabled:pointer-events-none cursor-pointer"
                        >
                            {isMinting && (
                                <div 
                                    className="absolute left-0 top-0 h-full bg-foreground/15 transition-all duration-300 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            )}
                            
                            <span className="relative z-10 w-full h-full flex flex-row items-center justify-center gap-2">
                                {isMinting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                        <span>Processing (<span className="font-mono text-xs">{progressPercent}%</span>)</span>
                                    </>
                                ) : (
                                    "Mint & Register Asset"
                                )}
                            </span>
                        </button>
                    )}
                    
                    <p className="text-[10px] font-mono text-muted-foreground text-center lg:text-left">
                        * Network gas fees apply
                    </p>

                    {mintError && (
                        <div 
                            title="Minting Error"
                            className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-2.5 mt-2 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p className="text-xs leading-relaxed">{mintError}</p>
                        </div>
                    )}
                </div>

                <div className="w-full lg:w-[55%]">
                    {isTrackerVisible && (
                        <div className="sm:p-5  rounded-xl space-y-4">
                            <h3 className="text-sm font-medium border-b border-border pb-2 text-foreground">
                                Minting Progress
                            </h3>
                            
                            <div className="flex flex-col space-y-3">
                                <div className={`flex items-start gap-2.5 text-xs transition-colors duration-300 ${getStepClass('analyzing_image')}`}>
                                    {renderStepIcon('analyzing_image')}
                                    <span className="mt-0.5">Scanning Image & Copyright Check</span>
                                </div>
                                <div className={`flex items-start gap-2.5 text-xs transition-colors duration-300 ${getStepClass('injecting_dna')}`}>
                                    {renderStepIcon('injecting_dna')}
                                    <span className="mt-0.5">Injecting Security DNA</span>
                                </div>
                                <div className={`flex items-start gap-2.5 text-xs transition-colors duration-300 ${getStepClass('uploading_ipfs')}`}>
                                    {renderStepIcon('uploading_ipfs')}
                                    <span className="mt-0.5">Uploading to Secure Storage</span>
                                </div>
                                <div className={`flex items-start gap-2.5 text-xs transition-colors duration-300 ${getStepClass('awaiting_wallet')}`}>
                                    {renderStepIcon('awaiting_wallet')}
                                    <span className="mt-0.5">Waiting for Wallet Approval</span>
                                </div>
                                <div className={`flex items-start gap-2.5 text-xs transition-colors duration-300 ${getStepClass('verifying_signature')}`}>
                                    {renderStepIcon('verifying_signature')}
                                    <span className="mt-0.5">Verifying Cryptographic Signature</span>
                                </div>
                                <div className={`flex items-start gap-2.5 text-xs transition-colors duration-300 ${getStepClass('minting_blockchain')}`}>
                                    {renderStepIcon('minting_blockchain')}
                                    <span className="mt-0.5">Registering on Blockchain</span>
                                </div>
                                <div className={`flex items-start gap-2.5 text-xs transition-colors duration-300 ${getStepClass('syncing_database')}`}>
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