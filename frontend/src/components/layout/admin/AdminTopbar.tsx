'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, LogOut, Sun, Moon, Shield } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAdminStore } from '@/store/useAdminStore';
import { cn } from '@/lib/utils';

export function AdminTopbar() {
  const { toggleSidebar } = useUIStore();
  const { admin, checkAdminSession, logoutAdmin } = useAdminStore();
  const { theme, setTheme } = useTheme();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAdminSession();
  }, [checkAdminSession]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md fixed w-full z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-3 w-auto md:w-64">
        <button
          onClick={toggleSidebar}
          className="hidden md:block p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <div className=" hidden w-8 h-8 bg-primary rounded-md md:flex items-center justify-center shrink-0">
            <span className=" text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight">ProveNode</span>
          <span className="text-[9px] font-bold text-primary mt-2 rounded uppercase tracking-wider">
            Admin
          </span>
        </Link>
      </div>

      <div className="flex sm:pr-1 items-center  sm:gap-1 relative">
        
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative flex items-center justify-center w-7 h-7 rounded-full border border-transparent hover:border-border hover:bg-muted transition-all"
        >
          <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
          <span className="sr-only">Toggle theme</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-1 transition-colors"
          >
            <span className="text-sm sm:text-md font-medium text-foreground/80 hover:text-foreground transition-colors">
              {admin?.fullName || "Admin"}
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 p-1 bg-background border border-border rounded-md shadow-lg z-50">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-medium text-foreground truncate">{admin?.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">{admin?.role}</p>
              </div>

              <div className="h-px bg-border my-1 mx-1" />

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logoutAdmin();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-sm transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}