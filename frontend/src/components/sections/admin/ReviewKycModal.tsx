"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Copy, Check, X, ZoomIn, ShieldCheck, CopyCheck } from "lucide-react";
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
                    className="w-[92vw] sm:max-w-md bg-card border-border p-5 overflow-hidden shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto"
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
                    
                    <div className="flex flex-col space-y-5">
                        <div className="border-b border-border pb-3.5">
                            <div className="flex items-center gap-2.5 mb-1">
                                <h2 className="text-sm font-semibold text-foreground tracking-tight">{selectedUser.fullName}</h2>
                                <span 
                                    style={{
                                        backgroundColor: "color-mix(in oklch, var(--status-warning, oklch(0.769 0.188 70.08)) 12%, transparent)",
                                        color: "var(--status-warning, oklch(0.769 0.188 70.08))",
                                        borderColor: "color-mix(in oklch, var(--status-warning, oklch(0.769 0.188 70.08)) 30%, transparent)"
                                    }}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border uppercase tracking-wider shrink-0"
                                >
                                    Pending Review
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
                            <div className="flex items-center justify-between py-1">
                                <span className="text-muted-foreground">Email Address</span>
                                <span className="text-foreground font-sans break-all">{selectedUser.email}</span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-muted-foreground">Applied Date</span>
                                <span className="text-foreground font-mono">
                                    {format(new Date(selectedUser.kycSubmittedAt || new Date()), "dd MMM yyyy, hh:mm a")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-muted-foreground">Gov ID Number</span>
                                <span className="text-foreground font-mono">
                                    {selectedUser.governmentId || <span className="text-muted-foreground italic font-sans">Not Provided</span>}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">Gov ID</p>
                                <div 
                                    onClick={() => selectedUser.govIdImageUrl && setZoomedImage(selectedUser.govIdImageUrl)}
                                    className="relative group aspect-4/3 rounded-lg border border-border bg-zinc-200/30 dark:bg-zinc-900/50 overflow-hidden cursor-zoom-in"
                                    title="Click to zoom Gov ID image"
                                >
                                    {selectedUser.govIdImageUrl ? (
                                        <>
                                            <img 
                                                src={selectedUser.govIdImageUrl} 
                                                alt="Gov ID" 
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ZoomIn className="text-white w-4 h-4" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-mono">No Image</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">Selfie</p>
                                <div 
                                    onClick={() => selectedUser.selfieWithGovIdUrl && setZoomedImage(selectedUser.selfieWithGovIdUrl)}
                                    className="relative group aspect-4/3 rounded-lg border border-border bg-zinc-200/30 dark:bg-zinc-900/50 overflow-hidden cursor-zoom-in"
                                    title="Click to zoom Selfie image"
                                >
                                    {selectedUser.selfieWithGovIdUrl ? (
                                        <>
                                            <img 
                                                src={selectedUser.selfieWithGovIdUrl} 
                                                alt="Selfie" 
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ZoomIn className="text-white w-4 h-4" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-mono">No Image</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-border flex flex-col-reverse sm:flex-row justify-end items-center gap-2.5">
                            {!rejectMode ? (
                                <>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setRejectMode(true)}
                                        disabled={isApproving}
                                        className="w-full sm:w-auto text-muted-foreground hover:text-status-error hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-xs font-medium rounded-md h-8 px-3 cursor-pointer"
                                        title="Reject KYC Submission"
                                    >
                                        Reject
                                    </Button>
                                    <Button 
                                        onClick={handleApprove}
                                        disabled={isApproving}
                                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] text-xs font-medium gap-1.5 shadow-sm rounded-md h-8 px-3.5 cursor-pointer"
                                        title="Approve & Register on Smart Contract"
                                    >
                                        {isApproving ? (
                                            <span className="flex items-center gap-1.5 font-mono text-xs">
                                                <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                                Executing...
                                            </span>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Approve & Register
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center gap-2 animate-in slide-in-from-right-4 w-full sm:w-auto">
                                    <div className="flex w-full sm:w-auto items-center gap-1.5">
                                        <input 
                                            type="text" 
                                            placeholder="Reason..." 
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            className="flex h-8 w-full sm:w-48 rounded-md border border-border bg-transparent px-2.5 py-1 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-status-error"
                                            autoFocus
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-md"
                                            onClick={() => { setRejectMode(false); setRejectReason(""); }}
                                            title="Cancel Rejection"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <Button 
                                        variant="destructive" 
                                        onClick={handleReject}
                                        disabled={isRejecting}
                                        className="w-full sm:w-auto font-medium text-xs shrink-0 h-8 px-3 rounded-md"
                                        title="Confirm Rejection"
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