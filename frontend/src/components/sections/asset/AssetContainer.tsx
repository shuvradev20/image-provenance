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
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-background gap-4 sm:gap-8">
            <div className="w-full h-[40%] lg:h-full lg:w-[55%] bg-muted/5 border border-border/40 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center relative">
                    <AssetImage 
                        thumbnailUrl={assetData.thumbnailUrl} 
                        title={assetData.title}
                        status={assetData.status} 
                    />
                </div>
            </div>
            <div className="sm:m-8 flex-1 min-h-0 overflow-y-auto pr-2 md:pr-4 flex flex-col gap-8 md:gap-10 pb-20 scroll-smooth custom-scrollbar">
                <AssetDetails 
                    asset={assetData} 
                    isOwner={assetData.isOwner} 
                    onUpdateSuccess={triggerRefresh} 
                    onlyHeader={true} 
                />
                <AssetOwnershipControls 
                    asset={assetData} 
                    isOwner={assetData.isOwner} 
                    onUpdateSuccess={triggerRefresh} 
                />
                <AssetDetails 
                    asset={assetData} 
                    isOwner={assetData.isOwner} 
                    onUpdateSuccess={triggerRefresh} 
                    onlyHeader={false} 
                />
                <AssetProofs asset={assetData} />
                <AssetTimeline history={assetData.history} />

            </div>
        </div>
    );
}