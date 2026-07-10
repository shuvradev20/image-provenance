'use client';

import { useEffect, useState} from 'react';
import Link from 'next/link';
import {Menu, Search, Wallet, Loader2} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { ProveNodeLogoLight, ProveNodeLogoDark } from '@/components/icons/ProveNodeLogo';
import { UserDropdown } from './UserDropdown';
import { SearchArea } from './SearchArea';


const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function Topbar() {
  const { toggleSidebar } = useUIStore();
  const { user, isAuthenticated, currentActiveWallet, isConnectingWallet, linkWalletBackend, listenToWalletChanges } = useAuthStore();
  const isWalletMismatch = isAuthenticated && user?.walletAddress && currentActiveWallet && user.walletAddress.toLowerCase() !== currentActiveWallet.toLowerCase();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    listenToWalletChanges();
  }, [listenToWalletChanges]);

  return (
    <>
      {isWalletMismatch && (
        <div className="fixed top-0 inset-x-0 z-100 bg-red-500 text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium shadow-md">
          ⚠️ Wallet Mismatch Detected! Please switch back to your registered wallet ({formatAddress(user?.walletAddress || '')}) in MetaMask.
        </div>
      )}

      <header className={cn(
        "h-16 bg-white/90 dark:bg-[#1C1C1C]/90 border-b border-border backdrop-blur-md fixed w-full z-40 flex items-center justify-between px-4 transition-all duration-300",
        isWalletMismatch ? "top-10" : "top-0"
      )}>
        <div className="flex items-center gap-3 w-auto md:w-64">
          <button
            onClick={toggleSidebar}
            className="hidden cursor-pointer md:block p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <ProveNodeLogoLight className="w-5 h-5 block dark:hidden" />
            <ProveNodeLogoDark className="w-5 h-5 hidden dark:block" />
            <span className="font-bold text-xl tracking-tight text-foreground">ProveNode</span>
          </Link>
        </div>

        <SearchArea isMobileSearchOpen={isMobileSearchOpen} setIsMobileSearchOpen={setIsMobileSearchOpen} />

        <div className="flex items-center sm:px-1 gap-2 md:gap-5 relative">
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-muted transition-colors "
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>

          {currentActiveWallet ? (
            <UserDropdown />
          ) : (
            <button
              onClick={linkWalletBackend}
              disabled={isConnectingWallet}
              className={cn(
                "flex items-center justify-center gap-2 border bg-black text-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 rounded-full transition-all font-medium",
                "p-2 w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 text-sm text-neutral-300",
                isConnectingWallet ? "opacity-70 cursor-not-allowed" : "hover:opacity-90 dark:hover:border-neutral-500 shadow-sm"
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
    </>
  );
}