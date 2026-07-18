"use client";

import { AlertCircle, ShieldAlert, Wallet, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function MintPreChecks({ children }: { children: React.ReactNode }) {
    // 1. isLoading ta store theke niye asho
    const { user, linkWalletBackend, isConnectingWallet, walletError, isLoading } = useAuthStore(); 

    // 2. Data load howa porjonto loading spinner dekhabe
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 border border-border border-dashed rounded-2xl bg-muted/10">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Verifying enterprise credentials...</p>
            </div>
        );
    }

    // Store er data diye condition check (Ebar perfectly kaj korbe karon load shesh)
    const isWalletConnected = !!user?.walletAddress; 
    const isKycVerified = user?.kycStatus === 'verified';

    if (!isWalletConnected || !isKycVerified) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-border border-dashed rounded-2xl bg-muted/20">
                
                <ShieldAlert className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Action Required</h2>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                    To maintain enterprise-grade security and provenance authenticity, you must complete your profile setup before minting digital assets.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {!isKycVerified && (
                        <Link 
                            href="/dashboard/profile" 
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium transition-transform active:scale-95"
                        >
                            <ShieldAlert className="w-4 h-4" />
                            {user?.kycStatus === 'pending' || user?.kycStatus === 'processing' 
                                ? "Check KYC Status" 
                                : "Complete KYC Verification"
                            }
                        </Link>
                    )}
                    
                    {!isWalletConnected && (
                        <button 
                            onClick={linkWalletBackend}
                            disabled={isConnectingWallet}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium transition-transform active:scale-95 disabled:opacity-80"
                        >
                            {isConnectingWallet ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Wallet className="w-4 h-4" />
                            )}
                            {isConnectingWallet ? "Connecting Wallet..." : "Connect Web3 Wallet"}
                        </button>
                    )}
                </div>

                {walletError && (
                    <div className="flex items-start gap-2 mt-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="font-medium">{walletError}</p>
                    </div>
                )}
                
            </div>
        );
    }

    return <>{children}</>;
}