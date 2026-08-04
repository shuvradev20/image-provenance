'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Copy, CopyCheck, LogOut, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function UserDropdown() {
  const { user, currentActiveWallet, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentActiveWallet) {
      navigator.clipboard.writeText(currentActiveWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentActiveWallet) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        title={currentActiveWallet}
        className={cn(
          "flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-full text-foreground",
          "w-10 h-10 p-0 border-0 bg-transparent", 
          "md:w-auto md:h-10 md:px-3 md:py-1.5 md:border md:border-border md:bg-background",
          "hover:opacity-80 md:hover:opacity-100 md:hover:bg-zinc-200/80 md:dark:hover:bg-zinc-800",
          isOpen && "opacity-80 md:opacity-100 md:bg-zinc-200/80 md:dark:bg-zinc-800 md:border-border"
        )}
      >
        <div className="w-7 h-7 md:m-0 md:w-6 md:h-6 rounded-full shrink-0 shadow-inner overflow-hidden flex items-center border border-border justify-center bg-zinc-100 dark:bg-zinc-800">
          {user?.profileImage ? (
            <Image 
              src={user.profileImage} 
              alt="Profile" 
              width={40} 
              height={40} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-tr from-[#f58320] via-[#c6307e] to-[#4527a0]" />
          )}
        </div>
        <span className="text-sm font-mono font-medium tracking-tight text-foreground hidden md:inline-block">
          {formatAddress(currentActiveWallet)}
        </span>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 p-1.5 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
          <Link
            title="View Creator Profile"
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 rounded-lg transition-colors group cursor-pointer"
          >
            <UserCircle className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium text-sm truncate text-foreground">
                {user?.fullName || "Unnamed Creator"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate font-normal">
                View Profile
              </span>
            </div>
          </Link>

          <div className="h-px bg-border my-1" />

          <button
            type="button"
            onClick={handleCopyAddress}
            title={copied ? "Copied to clipboard!" : `Copy`}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {copied ? (
                <CopyCheck className="w-4 h-4 shrink-0 text-foreground animate-in zoom-in-75 duration-150" />
              ) : (
                <Copy className="w-4 h-4 shrink-0" />
              )}
              <span className="text-sm">Copy Address</span>
            </div>
          </button>

          <div className="h-px bg-border my-1" />

          <button
            onClick={() => {
              if (logout) logout();
              setIsOpen(false);
            }}
            title="Disconnect wallet & logout"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-status-error/90 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors group cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-colors" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}