'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchAreaProps {
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: (val: boolean) => void;
}

export function SearchArea({ isMobileSearchOpen, setIsMobileSearchOpen }: SearchAreaProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isMobileSearchOpen]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      const query = searchQuery.trim();
      
      if (query !== "") {
        if (query.startsWith('0x')) {
          if (query.length === 42) {
            router.push(`/dashboard/showcase/${query}`); 
          } else if (query.length === 66) {
            router.push(`/dashboard/asset/${query}`);
          } else {
            router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
          }
        } else {
          router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
        }
        setIsMobileSearchOpen(false); 
      }
    }
  };

  return (
    <>
      <div className="hidden md:flex flex-1 max-w-xl mx-3 group">
        <div className="flex items-stretch w-full h-10">
          <div className="flex-1 flex items-center border border-border bg-background rounded-l-full focus-within:border-ring transition-colors overflow-hidden z-10">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search"
            className="flex-1 min-w-0 h-full bg-transparent pl-5 pr-2 text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
            
            {searchQuery && (
              <button
                title="Clear input"
                onClick={() => setSearchQuery("")}
                className="px-3 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            title="Search"
            onClick={handleSearch}
            className="h-full px-6 bg-secondary hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-border border-l-0 rounded-r-full flex items-center justify-center transition-colors group/btn cursor-pointer"
          >
            <Search className="w-4 h-4 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
          </button>
          
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-background backdrop-blur-md z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 pt-4 border-b border-border">
            <div className="relative flex items-center bg-secondary/50 border border-border rounded-full focus-within:border-ring transition-colors">
              <Search 
                className="absolute left-4 w-4 h-4 text-muted-foreground shrink-0 cursor-pointer" 
                onClick={handleSearch}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full bg-transparent border-none focus:outline-none text-sm pl-11 pr-12 py-2.5 text-foreground placeholder:text-muted-foreground"
                placeholder="Search"
              />
              <button 
                onClick={() => {
                  searchQuery ? setSearchQuery("") : setIsMobileSearchOpen(false);
                }}
                title={searchQuery ? "Clear search" : "Close search"}
                className="absolute right-3 p-1.5 shrink-0 text-muted-foreground hover:text-foreground hover:bg-zinc-200/80 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileSearchOpen(false)}></div>
        </div>
      )}
    </>
  );
}