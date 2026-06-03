'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {Menu, Search, Bell, Wallet, Loader2, Copy, LogOut, UserCircle, X} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';


const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function Topbar() {
  const { toggleSidebar } = useUIStore();
  const { user, isAuthenticated, currentActiveWallet, isConnectingWallet, linkWalletBackend, listenToWalletChanges, logout } = useAuthStore();
  const isWalletMismatch = isAuthenticated && user?.walletAddress && currentActiveWallet && user.walletAddress.toLowerCase() !== currentActiveWallet.toLowerCase();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listenToWalletChanges();
  }, [listenToWalletChanges]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isMobileSearchOpen]);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentActiveWallet) {
      navigator.clipboard.writeText(currentActiveWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* ⚠️ The Global Warning Banner */}
      {isWalletMismatch && (
        <div className="fixed top-0 inset-x-0 z-100 bg-red-500 text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium shadow-md">
          ⚠️ Wallet Mismatch Detected! Please switch back to your registered wallet ({formatAddress(user?.walletAddress || '')}) in MetaMask.
        </div>
      )}

      <header className={cn(
        "h-16 border-b border-border bg-background/80 backdrop-blur-md fixed w-full z-40 flex items-center justify-between px-4 transition-all duration-300",
        isWalletMismatch ? "top-10" : "top-0" // Banner asle Topbar 40px niche nambe
      )}>
        <div className="flex items-center gap-3 w-auto md:w-64">
          <button
            onClick={toggleSidebar}
            className="hidden md:block p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl tracking-tight">ProveNode</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by hash, provenance ID, or name..."
              className="w-full bg-muted/50 border border-border rounded-full pl-10 pr-12 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
            />
          </div>
        </div>

        <div className="flex items-center sm:px-1 gap-2 md:gap-5 relative">

          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>

          {currentActiveWallet ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  "flex items-center justify-center gap-2 bg-secondary/50 border hover:bg-secondary/80 hover:border-border transition-all cursor-pointer shadow-sm rounded-full",
                  "w-9 h-9 p-0 md:w-auto md:h-auto md:px-3 md:py-1.5",
                  isDropdownOpen ? "border-primary/50 ring-2 ring-primary/20" : "border-border/50"
                )}
              >
                <div className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-linear-to-tr from-[#f58320] via-[#c6307e] to-[#4527a0] shrink-0 shadow-inner" />
                <span className="text-sm font-medium text-foreground hidden md:block">
                  {formatAddress(currentActiveWallet)}
                </span>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 p-1 bg-background border border-border rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 mb-1 hover:bg-muted rounded-lg transition-colors group cursor-pointer"
                  >
                    <UserCircle className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-sm truncate text-foreground">
                        {user?.fullName || "Unnamed Creator"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate font-medium">
                        View Profile
                      </span>
                    </div>
                  </Link>

                  <div className="h-px bg-border my-1 mx-1" />

                  <div className="flex flex-col">
                    <button
                      onClick={handleCopyAddress}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Copy className="w-5 h-5 shrink-0" />
                        <span>Copy Address</span>
                      </div>
                      {copied && <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Copied</span>}
                    </button>

                    <div className="h-px bg-border my-1 mx-1" />

                    <button
                      onClick={() => {
                        if (logout) logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors group"
                    >
                      <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-500 transition-colors" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={linkWalletBackend}
              disabled={isConnectingWallet}
              className={cn(
                "flex items-center gap-2 bg-primary text-primary-foreground rounded-full transition-all font-medium",
                "p-2 w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 text-sm",
                isConnectingWallet ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/90 shadow-sm"
              )}
            >
              {isConnectingWallet ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-4 md:h-4 animate-spin" />
                  <span className="hidden md:inline">Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Connect Wallet</span>
                </>
              )}
            </button>
          )}

        </div>
      </header>

      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 pt-4">
            
            <div className="relative flex items-center bg-muted/40 border border-border/50 rounded-full focus-within:border-primary/90 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground shrink-0" />
              
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-base pl-12 pr-14 py-2 text-foreground placeholder:text-muted-foreground/70"
                placeholder="Search..."
              />
              
              <button 
                onClick={() => {
                  if (searchQuery) {
                    setSearchQuery("");
                  } else {
                    setIsMobileSearchOpen(false);
                  }
                }}
                className="absolute right-3.5 p-1.5 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
          
          <div className="flex-1"></div>
        </div>
      )}
    </>
  );
}