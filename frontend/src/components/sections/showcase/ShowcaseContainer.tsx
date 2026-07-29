"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeroCard, PublicProfileProps } from "./PublicHeroCard";
import { AssetCard, AssetData } from "../explore/AssetCard";
import { getUserPublicProfileApi } from "@/lib/api/user";
import { AssetCardSkeleton } from "../explore/AssetCardSkeleton";
import { PublicHeroSkeleton } from "./publicHeroSkeleton";

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

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchShowcaseData = async (pageNum: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setFetchingMore(true);
      setError(null);

      const response = await getUserPublicProfileApi(walletAddress, pageNum, 12);
      const payload = response.data; 

      if (!isLoadMore) {
        setProfile(payload.profile);
        setAssets(payload.images);
      } else {
        setAssets((prev) => [...prev, ...payload.images]);
      }
      
      setPagination(payload.pagination);

    } catch (err: any) {
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
      <div className="w-full space-y-8 pb-18 md:pb-8">
        <PublicHeroSkeleton />

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
          
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
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-4 px-4">
        <div className="flex items-center gap-2 text-status-error text-sm font-medium text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || "Profile not found"}</span>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchShowcaseData(1)}
          className="text-xs font-medium cursor-pointer border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-18 md:pb-8">
        <PublicHeroCard 
            fullName={profile.fullName}
            bio={profile.bio}
            location={profile.location}
            kycStatus={profile.kycStatus || "unverified"}
            walletAddress={profile.walletAddress}
            coverImage={profile.coverImage}       
            profileImage={profile.profileImage} 
            socialLinks={profile.socialLinks}
        />

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-borde pb-2">
          <h2 className="text-sm font-medium text-foreground tracking-tight">
            Registered Assets
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {pagination?.totalImages || assets.length} Items
          </span>
        </div>

        {assets.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
            <p className="text-muted-foreground text-sm">This creator hasn't registered any assets yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {assets.map((asset) => (
                <AssetCard key={asset.imageHash} asset={asset} />
              ))}
            </div>

            {pagination?.hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore} 
                  disabled={fetchingMore}
                  className="cursor-pointer rounded-full px-5 h-9 text-xs font-medium border border-border bg-card text-foreground hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-all duration-200 min-w-28"
                >
                  {fetchingMore ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 text-muted-foreground" />
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