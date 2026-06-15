"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useKycStore } from "@/store/useKycStore";

export function VerifiedUserModal() {
    const { isVerifiedModalOpen, setVerifiedModalOpen, selectedUser, clearSelectedUser } = useKycStore();
    const [isCopied, setIsCopied] = useState(false);

    if (!selectedUser) return null;

    const handleClose = () => {
        setVerifiedModalOpen(false);
        setTimeout(() => {
            clearSelectedUser();
        }, 300); 
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast.success("Wallet address copied!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Dialog open={isVerifiedModalOpen} onOpenChange={handleClose}>
            <DialogContent 
                className="w-[95vw] sm:max-w-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 overflow-hidden shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto"
            >
                <DialogTitle className="sr-only">Verified User Details for {selectedUser.fullName}</DialogTitle>
                <DialogDescription className="sr-only">View registered user documents and blockchain details.</DialogDescription>
                
                <div className="flex flex-col space-y-6">

                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">{selectedUser.fullName}</h2>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-widest shrink-0">
                                Verified
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mt-1 sm:mt-0">
                            <span className="font-mono text-sm break-all">{selectedUser.walletAddress}</span>
                            <button 
                                onClick={() => copyToClipboard(selectedUser.walletAddress)}
                                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
                                title="Copy Wallet Address"
                            >
                                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Email Address</p>
                            <p className="text-sm text-zinc-800 dark:text-zinc-200 break-all">{selectedUser.email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Verification Date</p>
                            <p className="text-sm text-zinc-800 dark:text-zinc-200">
                                {format(new Date(selectedUser.kycSubmittedAt || new Date()), "dd MMM yyyy, hh:mm a")}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Gov ID Number</p>
                            <p className="text-sm text-zinc-800 dark:text-zinc-200 font-mono">
                                {selectedUser.governmentId || <span className="text-zinc-400 dark:text-zinc-600 italic font-sans">Not Provided</span>}
                            </p>
                        </div>
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Gov ID</p>
                            <div className="relative aspect-4/3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden">
                                {selectedUser.govIdImageUrl ? (
                                    <img 
                                        src={selectedUser.govIdImageUrl} 
                                        alt="Gov ID" 
                                        className="w-full h-full object-cover opacity-90"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs bg-zinc-100 dark:bg-zinc-900/50">No Image</div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Selfie</p>
                            <div className="relative aspect-4/3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden">
                                {selectedUser.selfieWithGovIdUrl ? (
                                    <img 
                                        src={selectedUser.selfieWithGovIdUrl} 
                                        alt="Selfie" 
                                        className="w-full h-full object-cover opacity-90"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs bg-zinc-100 dark:bg-zinc-900/50">No Image</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800/60 flex justify-center sm:justify-end items-center">
                        <Button 
                            className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-sm"
                            onClick={() => window.open("https://sepolia.arbiscan.io/address/0xd69dB2533BC5De08D7cB851BE9aca37062A9073b", "_blank")}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Arbiscan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}