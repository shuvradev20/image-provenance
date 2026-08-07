"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Copy, ExternalLink, CopyCheck } from "lucide-react";
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
                className="w-[92vw] sm:max-w-md bg-card border-border p-5 overflow-hidden shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto"
            >
                <DialogTitle className="sr-only">Verified User Details for {selectedUser.fullName}</DialogTitle>
                <DialogDescription className="sr-only">View registered user documents and blockchain details.</DialogDescription>
                
                <div className="flex flex-col space-y-5">
                    <div className="border-b border-border pb-3.5">
                        <div className="flex items-center gap-2.5 mb-1">
                            <h2 className="text-sm font-semibold text-foreground tracking-tight">{selectedUser.fullName}</h2>
                            <span 
                                style={{
                                    backgroundColor: "color-mix(in oklch, var(--status-success, oklch(0.627 0.194 149.214)) 12%, transparent)",
                                    color: "var(--status-success, oklch(0.627 0.194 149.214))",
                                    borderColor: "color-mix(in oklch, var(--status-success, oklch(0.627 0.194 149.214)) 30%, transparent)"
                                }}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border uppercase tracking-wider shrink-0"
                            >
                                Verified
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-mono text-[10px] break-all" title={selectedUser.walletAddress}>
                                {selectedUser.walletAddress}
                            </span>
                            <button 
                                onClick={() => copyToClipboard(selectedUser.walletAddress)}
                                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                title="Copy Wallet Address"
                            >
                                {isCopied ? <CopyCheck className="w-3.5 h-3.5 text-foreground" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2.5 py-0.5 font-mono text-[10px]">
                        <div className="flex items-center justify-between py-1 ">
                            <span className="text-muted-foreground">Email Address</span>
                            <span className="text-foreground font-sans break-all">{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 ">
                            <span className="text-muted-foreground">Verification Date</span>
                            <span className="text-foreground font-mono">
                                {format(new Date(selectedUser.kycSubmittedAt || new Date()), "dd MMM yyyy, hh:mm a")}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1 ">
                            <span className="text-muted-foreground">Gov ID Number</span>
                            <span className="text-foreground font-mono">
                                {selectedUser.governmentId || <span className="text-muted-foreground italic font-sans">Not Provided</span>}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">Gov ID</p>
                            <div className="relative aspect-4/3 rounded-lg border border-border bg-zinc-200/30 dark:bg-zinc-900/50 overflow-hidden">
                                {selectedUser.govIdImageUrl ? (
                                    <img 
                                        src={selectedUser.govIdImageUrl} 
                                        alt="Gov ID" 
                                        className="w-full h-full object-cover opacity-90"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-mono">No Image</div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">Selfie</p>
                            <div className="relative aspect-4/3 rounded-lg border border-border bg-zinc-200/30 dark:bg-zinc-900/50 overflow-hidden">
                                {selectedUser.selfieWithGovIdUrl ? (
                                    <img 
                                        src={selectedUser.selfieWithGovIdUrl} 
                                        alt="Selfie" 
                                        className="w-full h-full object-cover opacity-90"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-mono">No Image</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-border flex justify-end items-center">
                        <Button 
                            className="w-full sm:w-auto bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] text-xs font-medium gap-1.5 shadow-sm rounded-md h-8 px-3.5 cursor-pointer"
                            onClick={() => {
                                if (selectedUser.kycTransactionHash) {
                                    window.open(`https://sepolia.arbiscan.io/tx/${selectedUser.kycTransactionHash}`, "_blank");
                                } else {
                                    toast.error("Transaction hash not found for this user!");
                                }
                            }}
                            title="Open Explorer on Arbiscan"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View on Arbiscan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}