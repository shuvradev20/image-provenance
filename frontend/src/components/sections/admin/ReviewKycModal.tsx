"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Copy, Check, X, ZoomIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useKycStore } from "@/store/useKycStore";
import { approveKycApi, rejectKycApi } from "@/lib/api/admin";
import { Lightbox } from "@/components/ui/lightbox";

export function ReviewKycModal() {
    const { isPendingModalOpen, setPendingModalOpen, selectedUser, clearSelectedUser, fetchPendingKyc, fetchRecentKyc } = useKycStore();
    const [isCopied, setIsCopied] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    if (!selectedUser) return null;

    const handleClose = () => {
        setPendingModalOpen(false);
        setTimeout(() => {
            clearSelectedUser();
            setRejectMode(false);
            setRejectReason("");
            setZoomedImage(null);
        }, 300); 
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast.success("Wallet address copied!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleApprove = async () => {
        setIsApproving(true);
        const toastId = toast.loading("Executing Smart Contract Transaction...");
        try {
            await approveKycApi(selectedUser._id);
            toast.success("KYC Approved & Registered on Blockchain!", { id: toastId });
            fetchPendingKyc();
            fetchRecentKyc();
            handleClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Blockchain transaction failed", { id: toastId });
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setIsRejecting(true);
        const toastId = toast.loading("Rejecting KYC and clearing documents...");
        try {
            await rejectKycApi(selectedUser._id, rejectReason);
            toast.success("KYC Rejected successfully", { id: toastId });
            fetchPendingKyc();
            fetchRecentKyc();
            handleClose();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to reject KYC", { id: toastId });
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <>
            <Dialog open={isPendingModalOpen} onOpenChange={handleClose}>
                <DialogContent 
                    className="w-[95vw] sm:max-w-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 overflow-hidden shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto"
                    onInteractOutside={(e) => {
                        if (zoomedImage) {
                            e.preventDefault(); 
                        }
                    }}
                    onEscapeKeyDown={(e) => {
                        if (zoomedImage) {
                            e.preventDefault(); 
                        }
                    }}
                >
                    <DialogTitle className="sr-only">Review KYC details for {selectedUser.fullName}</DialogTitle>
                    <DialogDescription className="sr-only">Review user documents and approve them for smart contract registration.</DialogDescription>
                    
                    <div className="flex flex-col space-y-6">
                        
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">{selectedUser.fullName}</h2>
                                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-semibold border border-amber-200 dark:border-amber-500/20 uppercase tracking-widest shrink-0">
                                    Pending Review
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
                                <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Applied Date</p>
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
                                <div 
                                    onClick={() => selectedUser.govIdImageUrl && setZoomedImage(selectedUser.govIdImageUrl)}
                                    className="relative group aspect-4/3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden cursor-zoom-in"
                                >
                                    {selectedUser.govIdImageUrl ? (
                                        <>
                                            <img 
                                                src={selectedUser.govIdImageUrl} 
                                                alt="Gov ID" 
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 bg-black/30 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ZoomIn className="text-white w-6 h-6" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs bg-zinc-100 dark:bg-zinc-900/50">No Image</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Selfie</p>
                                <div 
                                    onClick={() => selectedUser.selfieWithGovIdUrl && setZoomedImage(selectedUser.selfieWithGovIdUrl)}
                                    className="relative group aspect-4/3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden cursor-zoom-in"
                                >
                                    {selectedUser.selfieWithGovIdUrl ? (
                                        <>
                                            <img 
                                                src={selectedUser.selfieWithGovIdUrl} 
                                                alt="Selfie" 
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 bg-black/30 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ZoomIn className="text-white w-6 h-6" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-xs bg-zinc-100 dark:bg-zinc-900/50">No Image</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800/60 flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
                            {!rejectMode ? (
                                <>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setRejectMode(true)}
                                        disabled={isApproving}
                                        className="w-full sm:w-auto text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
                                    >
                                        Reject
                                    </Button>
                                    <Button 
                                        onClick={handleApprove}
                                        disabled={isApproving}
                                        className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold gap-2 shadow-sm"
                                    >
                                        {isApproving ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                                Executing...
                                            </span>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4 h-4" />
                                                Approve & Register
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center gap-2 animate-in slide-in-from-right-4 w-full sm:w-auto">
                                    <div className="flex w-full sm:w-auto items-center gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Reason..." 
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            className="flex h-9 w-full sm:w-62.5 rounded-md border border-zinc-300 dark:border-zinc-800 bg-transparent dark:bg-zinc-900 px-3 py-1 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/50"
                                            autoFocus
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 shrink-0"
                                            onClick={() => { setRejectMode(false); setRejectReason(""); }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Button 
                                        variant="destructive" 
                                        onClick={handleReject}
                                        disabled={isRejecting}
                                        className="w-full sm:w-auto font-medium shrink-0 mt-2 sm:mt-0"
                                    >
                                        Confirm Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Lightbox 
                src={zoomedImage} 
                onClose={() => setZoomedImage(null)} 
            />
        </>
    );
}