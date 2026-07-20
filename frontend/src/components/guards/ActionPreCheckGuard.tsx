"use client";

import { AlertCircle, ShieldAlert, Wallet, Loader2, CheckCircle2, ChevronRight, Fingerprint } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { formatWalletError } from "@/lib/errors/walletErrors";

export default function ActionPreCheckGuard({ children }: { children: React.ReactNode }) {
    const { user, linkWalletBackend, isConnectingWallet, walletError, isLoading } = useAuthStore(); 

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Verifying access...</p>
            </div>
        );
    }

    const isWalletConnected = !!user?.walletAddress; 
    const isKycVerified = user?.kycStatus === 'verified';
    const isKycPending = user?.kycStatus === 'pending' || user?.kycStatus === 'processing';

    if (!isWalletConnected || !isKycVerified) {
        return (
           <div className="flex justify-center w-full sm:h-[calc(100vh-130px)] overflow-y-auto sm:pt-10 sm:overflow-hidden">
                <div className="w-full max-w-2xl">
                    <div className="rounded-xl border border-border">
                        <div className="flex flex-col p-4 sm:p-8">
                            <div className="flex flex-col mb-5">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-6 h-6 text-blue-500" />
                                    <h2 className="text-xl font-semibold text-foreground">Action Required</h2>
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">Please complete these steps to unlock all features.</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300`}>
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        {isWalletConnected ? (
                                            <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-muted-foreground">1</span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className={`font-semibold ${isWalletConnected ? 'text-foreground' : 'text-foreground'}`}>Connect Web3 Wallet</h3>
                                            <p className="text-sm text-muted-foreground">Link your wallet to sign transactions</p>
                                        </div>
                                    </div>
                                    
                                    {!isWalletConnected ? (
                                        <button 
                                            onClick={linkWalletBackend}
                                            disabled={isConnectingWallet}
                                            className="flex items-center justify-center cursor-pointer gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium transition-transform active:scale-95 disabled:opacity-80 w-full sm:w-auto"
                                        >
                                            {isConnectingWallet ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                                            {isConnectingWallet ? "Connecting..." : "Connect Wallet"}
                                        </button>
                                    ) : (
                                        <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-medium text-muted-foreground flex items-center gap-2 w-fit">
                                            Connected
                                        </div>
                                    )}
                                </div>

                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${!isWalletConnected ? 'opacity-50 pointer-events-none grayscale' : ''} ${isKycVerified ? 'bg-secondary/20 border-secondary/30' : 'bg-background border-border hover:border-primary/50'}`}>
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        {isKycVerified ? (
                                            <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-muted-foreground">2</span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-foreground">Identity Verification</h3>
                                            <p className="text-sm text-muted-foreground">Required to confirm your real-world identity.</p>
                                        </div>
                                    </div>

                                    {!isKycVerified ? (
                                        <Link 
                                            href="/dashboard/profile" 
                                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-medium transition-all active:scale-95 w-full sm:w-auto group"
                                        >
                                            <Fingerprint className="w-4 h-4" />
                                            {isKycPending ? "Check Status" : "Verify Identity"}
                                            <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    ) : (
                                        <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-medium text-green-500 flex items-center gap-2 w-fit">
                                            Verified
                                        </div>
                                    )}
                                </div>

                            </div>

                            {walletError && (
                                <div className="flex items-start gap-3 mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl animate-in fade-in zoom-in-95 duration-300">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm leading-relaxed mt-0.5">{formatWalletError(walletError)}</p>
                                </div>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return <>{children}</>;
}