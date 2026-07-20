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
    <div className="w-full min-h-[calc(100vh-98px)] lg:h-[calc(100vh-98px)] lg:overflow-hidden bg-muted/8 flex justify-center">
        <div className="flex flex-col lg:flex-row w-full max-w-287.5 h-auto lg:h-full mb-12 gap-8">
            <div className="w-full lg:w-[59%] h-auto lg:h-full sm:border-r flex items-center justify-center shrink-0 lg:p-12 aspect-square lg:aspect-auto">
                <div className="w-full h-full flex items-center justify-center relative rounded-xl overflow-hidden">
                    <AssetImage 
                        thumbnailUrl={assetData.thumbnailUrl} 
                        title={assetData.title}
                        status={assetData.status} 
                    />
                </div>
            </div>

            <div className="w-full lg:w-[41%] lg:h-full lg:overflow-y-auto lg:pr-4 flex flex-col gap-8 pb-10 scroll-smooth custom-scrollbar">
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
    </div>
);
}