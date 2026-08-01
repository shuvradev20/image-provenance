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

  const fetchAssetDetails = useCallback(
    async (isInitialLoad = false) => {
      if (isInitialLoad) setIsLoading(true);
      try {
        const res = await getImageByHashApi(hash, user?.walletAddress);
        setAssetData(res.data);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to load asset details."
        );
      } finally {
        if (isInitialLoad) setIsLoading(false);
      }
    },
    [hash, user?.walletAddress]
  );

  useEffect(() => {
    if (hash) fetchAssetDetails(true);
  }, [fetchAssetDetails, hash]);

  const triggerRefresh = () => fetchAssetDetails(false);

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-128px)] flex items-center justify-center border border-border rounded-xl bg-card pb-18 md:pb-8">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assetData) return null;

  return (
    <div className="w-full max-w-6xl pb-18 lg:pb-0">
        <div className="w-full h-auto lg:h-[calc(100vh-128px)] flex flex-col lg:flex-row rounded-xl bg-card dark:bg-zinc-900/60 overflow-hidden">
      <div className="w-full lg:w-[60%] h-87.5 lg:h-full relative p-6 lg:p-12 flex items-center justify-center shrink-0 overflow-hidden">
        <div className="w-full h-full max-h-full flex items-center justify-center relative rounded-lg overflow-hidden">
          <AssetImage
            thumbnailUrl={assetData.thumbnailUrl}
            title={assetData.title}
            status={assetData.status}
          />
        </div>
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 my-8 w-px bg-border" />
      </div>

      <div className="w-full lg:w-[40%] h-auto lg:h-full lg:overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar shrink">
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