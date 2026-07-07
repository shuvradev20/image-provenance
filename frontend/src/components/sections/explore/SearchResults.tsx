'use client';

import { useEffect, useState } from 'react';
import { SearchX, Loader2 } from 'lucide-react';
import {searchAssetsApi} from '@/lib/api/image'
import { AssetCard, type AssetData } from './AssetCard';

export default function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
    if (!query) return;
      setLoading(true);

      try {
        const response = await searchAssetsApi(query);
        setResults(response.data || []); 
        } catch (error) {
            console.error("Failed to fetch search results:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
        };

        fetchSearchResults();
    }, [query]);

    if (loading) {
        return (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Searching ProveNode...</p>
        </div>
        );
    }

    if (query && results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed border-border mt-8">
                <div className="bg-muted p-4 rounded-full mb-4">
                    <SearchX className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No assets found</h2>
                <p className="text-muted-foreground max-w-md">
                    We couldn't find any images matching "{query}". Try checking for typos or searching with different keywords like 'photography' or 'nature'.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((asset: any) => (
                <AssetCard 
                    key={asset.imageHash} 
                    asset={asset} 
                />
            ))}
        </div>
    );
}