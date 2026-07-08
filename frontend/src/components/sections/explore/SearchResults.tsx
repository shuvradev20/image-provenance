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
        <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Searching ProveNode...</p>
        </div>
        );
    }

    if (query && results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50 dark:bg-[#1C1C1C] rounded-2xl border border-dashed border-border mt-8 transition-colors duration-300 shadow-sm">
                <div className="bg-gray-100 dark:bg-muted/40 p-4 rounded-full mb-4 ring-1 ring-border/50">
                    <SearchX className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">No results found</h3>
                <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                  We couldn't find anything matching "<span className="text-foreground/80 font-medium">{query}</span>". Try searching with a different keyword, wallet address, or hash.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {results.map((asset: any) => (
                <AssetCard 
                    key={asset.imageHash} 
                    asset={asset} 
                />
            ))}
        </div>
    );
}