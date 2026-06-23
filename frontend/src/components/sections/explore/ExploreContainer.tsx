"use client";

import { useEffect, useState } from "react";
import { AssetCard, AssetData } from "./AssetCard";
import { getAllImagesApi } from "@/lib/api/image";
import { Loader2, RefreshCw } from "lucide-react";
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
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchAssets = async (pageNum: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setFetchingMore(true);
      setError(null);

      // Ekhon ar direct axios na, amader clean helper function call hocche
      const response = await getAllImagesApi(pageNum, 12); 
      
      // Tomar backend er ApiResponse class onujayi main data property theke value nilam
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
      <div className="w-full space-y-8 pb-10">
        {/* Header rekhe dile page jump korbe na */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Explore Assets</h1>
            <p className="text-zinc-400 mt-1">Discover authentic verified digital properties.</p>
          </div>
        </div>
        
        {/* Skeleton Grid (ekhane 8 ta dummy card dekano hobe) */}
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
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <p className="text-red-400">{error}</p>
        <Button variant="outline" onClick={() => fetchAssets(1)}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Explore Assets</h1>
          <p className="text-zinc-400 mt-1">Discover authentic verified digital properties.</p>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30">
          <p className="text-zinc-500">No verified assets found in the network yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.imageHash} asset={asset} />
            ))}
          </div>

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
  );
};