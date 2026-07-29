"use client";

import { useEffect, useState } from "react";
import { AssetCard, AssetData } from "./AssetCard";
import { getAllImagesApi } from "@/lib/api/image";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetCardSkeleton } from "./AssetCardSkeleton";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  totalImages?: number;
  limit?: number;
}

export const ExploreContainer = () => {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchAssets = async (pageNum: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setFetchingMore(true);
      setError(null);

      const response = await getAllImagesApi(pageNum, 12); 
      const payload = response.data; 

      if (isLoadMore) {
        setAssets((prev) => [...prev, ...payload.images]);
      } else {
        setAssets(payload.images);
      }
      
      setPagination(payload.pagination);
    } catch (err: any) {
      console.error("Explore fetch error:", err);
      setError("Failed to load assets. Please try again.");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchAssets(1);
  }, []);

  const handleLoadMore = () => {
    if (pagination?.hasNextPage && !fetchingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAssets(nextPage, true);
    }
  };
  

  if (loading) {
    return (
      <div className="w-full space-y-8 pb-18 md:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <AssetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-4 px-4">
        <div className="flex items-center gap-2 text-status-error text-sm font-medium text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchAssets(1)}
          className="text-xs font-medium cursor-pointer border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-18 md:pb-8">
      {assets.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
          <p className="text-muted-foreground text-sm">No verified assets found in the network yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.imageHash} asset={asset} />
            ))}
          </div>

          {pagination?.hasNextPage && (
            <div className="flex justify-center">
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
  );
};