"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import ActionPreCheckGuard from "@/components/guards/ActionPreCheckGuard";
import { Loader2 } from "lucide-react";

export default function ShowcaseAccess() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user?.walletAddress && user?.kycStatus === 'verified') {
            router.push(`/dashboard/showcase/${user.walletAddress}`);
        }
    }, [user?.walletAddress, user?.kycStatus, router]);

    return (
        <ActionPreCheckGuard>
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">
                    Loading your showcase...
                </p>
            </div>
        </ActionPreCheckGuard>
    );
}