"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { ArrowRight, FileText, Clock } from "lucide-react";
import { useKycStore } from "@/store/useKycStore";
import { toast } from "sonner";

export function RecentKycTable() {
    const { recentUsers: users, isLoadingRecent: isLoading, fetchRecentKyc, fetchUserDetailsForModal, setPendingModalOpen } = useKycStore();

    useEffect(() => {
        fetchRecentKyc();
    }, [fetchRecentKyc]);

    const formatWallet = (address: string) => {
        if (!address) return "N/A";
        return address.substring(0, 6) + "..." + address.substring(address.length - 4);
    };

    const handleReviewClick = async (userId: string) => {
        toast.loading("Loading user documents...");
        await fetchUserDetailsForModal(userId);
        toast.dismiss();
        setPendingModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="h-64 border border-border rounded-xl flex items-center justify-center bg-muted/10 animate-pulse">
                <p className="text-muted-foreground">Loading recent requests...</p>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="h-64 border border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/10">
                <FileText className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground font-medium">No pending KYC requests</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-medium">User Profile</th>
                            <th className="px-6 py-4 font-medium">Wallet Address</th>
                            <th className="px-6 py-4 font-medium">Date Applied</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="font-semibold text-primary text-sm uppercase">
                                                {user.fullName?.charAt(0) || "U"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{user.fullName}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                
                                <td className="px-6 py-4">
                                    <span className="font-mono text-sm text-muted-foreground tracking-normal [font-variant-ligatures:none]">
                                        {formatWallet(user.walletAddress)}
                                    </span>
                                </td>
                                
                                <td className="px-6 py-4 text-muted-foreground">
                                    {user.kycSubmittedAt ? format(new Date(user.kycSubmittedAt), "dd MMM, yyyy") : "N/A"}
                                </td>
                                
                                <td className="px-6 py-4">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-medium border border-amber-500/20 uppercase tracking-wide">
                                        <Clock className="w-3 h-3" />
                                        Pending
                                    </div>
                                </td>
                                
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleReviewClick(user._id)}
                                        className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md cursor-pointer"
                                    >
                                        Review <ArrowRight className="w-3 h-3 ml-1.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}