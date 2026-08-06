'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { ProveNodeLogoLight, ProveNodeLogoDark } from '@/components/icons/ProveNodeLogo';

export function AdminTopbar() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 bg-background border-b border-border backdrop-blur-md fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-foreground hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <ProveNodeLogoLight className="w-5 h-5 block dark:hidden shrink-0" />
          <ProveNodeLogoDark className="w-5 h-5 hidden dark:block shrink-0" />
          <span className="font-heading font-semibold text-xl tracking-tight text-foreground">
            ProveNode
          </span>
          <span className="ml-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-muted text-muted-foreground border border-border uppercase tracking-widest">
            Admin
          </span>
        </Link>
      </div>
    </header>
  );
}