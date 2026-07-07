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
          <div className="flex-1 flex items-center border border-border bg-background rounded-l-full focus-within:border-black dark:focus-within:border-gray-400 transition-all overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search"
            className="flex-1 min-w-0 h-full bg-transparent pl-5 pr-2 text-base focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
            
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-3 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="h-full px-6 bg-muted/50 hover:bg-muted border border-l-0 border-border rounded-r-full flex items-center justify-center transition-colors group/btn cursor-pointer"
          >
            <Search className="w-5 h-5 text-muted-foreground group-hover/btn:text-foreground" />
          </button>
          
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-60 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 pt-4">
            <div className="relative flex items-center bg-muted/40 border border-border/50 rounded-full focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <Search 
                className="absolute left-4 w-5 h-5 text-muted-foreground shrink-0 cursor-pointer" 
                onClick={handleSearch}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full bg-transparent border-none focus:outline-none text-base pl-12 pr-14 py-2 text-foreground placeholder:text-muted-foreground/70"
                placeholder="Search"
              />
              <button 
                onClick={() => {
                  searchQuery ? setSearchQuery("") : setIsMobileSearchOpen(false);
                }}
                className="absolute right-3.5 p-1.5 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-full transition-colors"
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