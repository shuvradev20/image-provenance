'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Copy, LogOut, UserCircle } from 'lucide-react';
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
        className={cn(
          "flex items-center justify-center gap-2 bg-secondary/50 border hover:bg-secondary/80 hover:border-border transition-all cursor-pointer shadow-sm rounded-full",
          "w-9 h-9 p-0 md:w-auto md:h-auto md:px-3 md:py-1.5",
          isOpen ? "border-primary/50 ring-2 ring-primary/20" : "border-border/50"
        )}
      >
        <div className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-linear-to-tr from-[#f58320] via-[#c6307e] to-[#4527a0] shrink-0 shadow-inner" />
        <span className="text-sm font-medium text-foreground hidden md:block">
          {formatAddress(currentActiveWallet)}
        </span>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 p-1 bg-background border border-border rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
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
                setIsOpen(false);
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
  );
}