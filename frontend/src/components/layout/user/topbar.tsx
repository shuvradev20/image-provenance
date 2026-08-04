'use client';

import { useEffect, useState} from 'react';
import Link from 'next/link';
import {Menu, Search, Wallet, Loader2, AlertTriangle} from 'lucide-react';
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
        <div className="fixed top-0 inset-x-0 z-50 bg-status-error/15 border-b border-status-error/30 text-status-error text-xs sm:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2 backdrop-blur-md">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Wallet Mismatch Detected! Switch back to registered wallet (
            <span 
              className="font-mono underline cursor-help" 
              title={user?.walletAddress || ''}
            >
              {formatAddress(user?.walletAddress || '')}
            </span>) in MetaMask.
          </span>
        </div>
      )}

      <header className={cn(
        "h-16 bg-background border-b border-border backdrop-blur-md fixed w-full z-40 flex items-center justify-between px-4 transition-[top] duration-300 ease-in-out",
          isWalletMismatch ? "top-9" : "top-0"
      )}>
        <div className="flex items-center gap-3 w-auto md:w-60">
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-foreground hover:bg-zinc-200/80 dark:hover:bg-zinc-800 hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <ProveNodeLogoLight className="w-5 h-5 block dark:hidden" />
            <ProveNodeLogoDark className="w-5 h-5 hidden dark:block" />
            <span className="font-heading font-semibold text-xl tracking-tight text-foreground">ProveNode</span>
          </Link>
        </div>

        <SearchArea isMobileSearchOpen={isMobileSearchOpen} setIsMobileSearchOpen={setIsMobileSearchOpen} />

        <div className="flex items-center pr-2 gap-2 md:gap-3 relative">
          <button
            title="Search"
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-zinc-200/80 dark:hover:bg-zinc-800 hover:text-foreground transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {currentActiveWallet ? (
            <UserDropdown />
          ) : (
            <button
              title={isConnectingWallet ? "Connecting to wallet..." : "Connect your Web3 wallet"}
              onClick={linkWalletBackend}
              disabled={isConnectingWallet}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl transition-all font-medium text-sm cursor-pointer",
                "bg-primary text-primary-foreground",
                "h-10 px-4 py-2",
                isConnectingWallet 
                  ? "opacity-70 cursor-not-allowed" 
                  : "hover:opacity-90 active:scale-[0.98]"
              )}
            >
              {isConnectingWallet ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>
    </>
  );
}