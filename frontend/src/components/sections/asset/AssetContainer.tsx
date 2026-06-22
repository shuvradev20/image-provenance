"use client";

import { useEffect, useState, useCallback } from "react";
import { getImageByHashApi } from "@/lib/api/image";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import AssetImage from "./AssetImage";
import AssetDetails from "./AssetDetails";
import AssetProofs from "./AssetProofs";
import AssetTimeline from "./AssetTimeline";
import AssetOwnershipControls from "./AssetOwnershipControls";

export default function AssetContainer({ hash }: { hash: string }) {
    const { user } = useAuthStore();
    const [assetData, setAssetData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAssetDetails = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setIsLoading(true);
        try {
            const res = await getImageByHashApi(hash, user?.walletAddress);
            setAssetData(res.data);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to load asset details.");
        } finally {
            if (isInitialLoad) setIsLoading(false);
        }
    }, [hash, user?.walletAddress]);

    useEffect(() => {
        if (hash) fetchAssetDetails(true);
    }, [fetchAssetDetails, hash]);

    const triggerRefresh = () => fetchAssetDetails(false);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!assetData) return null;

    return (
        // Premium 55/45 split layout - Fixed Heights
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
            
            {/* LEFT SIDE: 55% Fixed Image View */}
            <div className="w-full lg:w-[55%] h-[50vh] lg:h-full bg-muted/5 border-r border-border/40 flex items-center justify-center p-6 lg:p-10 relative">
                <div className="w-full max-w-2xl">
                    <AssetImage 
                        thumbnailUrl={assetData.thumbnailUrl} 
                        title={assetData.title}
                        status={assetData.status} 
                    />
                </div>
            </div>

            {/* RIGHT SIDE: 45% Scrollable Content */}
            <div className="w-full lg:w-[45%] h-full overflow-y-auto p-6 lg:p-10 xl:p-14 flex flex-col gap-10 scroll-smooth pb-24">
                
                {/* Card 1: Identity & Story */}
                <AssetDetails 
                    asset={assetData} 
                    isOwner={assetData.isOwner} 
                    onUpdateSuccess={triggerRefresh} 
                    onlyHeader={true} 
                />

                {/* Card 2: Creators, Owners & Actions */}
                <AssetOwnershipControls 
                    asset={assetData} 
                    isOwner={assetData.isOwner} 
                    onUpdateSuccess={triggerRefresh} 
                />

                {/* Card 3: Technical Specs */}
                <AssetDetails 
                    asset={assetData} 
                    isOwner={assetData.isOwner} 
                    onUpdateSuccess={triggerRefresh} 
                    onlyHeader={false} 
                />

                {/* Card 4: Web3 Proofs */}
                <AssetProofs asset={assetData} />

                {/* Card 5: History / Timeline */}
                <AssetTimeline history={assetData.history} />

            </div>
        </div>
    );
}