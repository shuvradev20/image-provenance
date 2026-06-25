"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeroCard, PublicProfileProps } from "./PublicHeroCard";
import { AssetCard, AssetData } from "../explore/AssetCard";
import { getUserPublicProfileApi } from "@/lib/api/user";
import { AssetCardSkeleton } from "../explore/AssetCardSkeleton";

interface ShowcaseContainerProps {
  walletAddress: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  totalImages?: number;
}

export const ShowcaseContainer = ({ walletAddress }: ShowcaseContainerProps) => {
  const [profile, setProfile] = useState<PublicProfileProps | null>(null);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchShowcaseData = async (pageNum: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setFetchingMore(true);
      setError(null);

      // Backend API Call
      const response = await getUserPublicProfileApi(walletAddress, pageNum, 12);
      
      // Tomar ApiResponse backend structure onujayi data extract kora
      const payload = response.data; 

      if (!isLoadMore) {
        setProfile(payload.profile);
        setAssets(payload.images);
      } else {
        setAssets((prev) => [...prev, ...payload.images]);
      }
      
      setPagination(payload.pagination);

    } catch (err: any) {
      console.error("Failed to load showcase data:", err);
      // 404 hole user not found error dekhabo
      if (err?.response?.status === 404) {
        setError("User profile not found.");
      } else {
        setError("Failed to load profile. Please try again later.");
      }
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchShowcaseData(1);
    }
  }, [walletAddress]);

  const handleLoadMore = () => {
    if (pagination?.hasNextPage && !fetchingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchShowcaseData(nextPage, true);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-12 pb-10">
        {/* Hero Card Skeleton */}
        <div className="w-full h-[350px] rounded-2xl bg-zinc-900/40 animate-pulse border border-zinc-800/50"></div>

        {/* Bottom Section: Assets Skeleton */}
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
            <div className="h-8 w-48 bg-zinc-800/60 rounded animate-pulse"></div>
            <div className="h-7 w-20 bg-zinc-800/60 rounded-full animate-pulse"></div>
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <AssetCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <p className="text-zinc-300 text-lg font-medium">{error || "Profile not found"}</p>
        <Button variant="outline" onClick={() => fetchShowcaseData(1)}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 pb-10">
      
      {/* Top Section: Read-Only Hero Card */}
        <PublicHeroCard 
            fullName={profile.fullName}
            bio={profile.bio}
            location={profile.location}
            kycStatus={profile.kycStatus || "unverified"}
            walletAddress={profile.walletAddress}
            coverImage={profile.coverImage}       
            profileImage={profile.profileImage} 
        />

      {/* Bottom Section: Asset Gallery */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Registered Assets
          </h2>
          <span className="text-sm font-medium text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
            {pagination?.totalImages || assets.length} Items
          </span>
        </div>

        {assets.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30">
            <p className="text-zinc-500">This creator hasn't registered any assets yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {assets.map((asset) => (
                <AssetCard key={asset.imageHash} asset={asset} />
              ))}
            </div>

            {/* Load More Button */}
            {pagination?.hasNextPage && (
              <div className="flex justify-center pt-8">
                <Button 
                  variant="secondary" 
                  onClick={handleLoadMore} 
                  disabled={fetchingMore}
                  className="min-w-[150px]"
                >
                  {fetchingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {fetchingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};