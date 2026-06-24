'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  Globe, // Showcase er jonno
  ShieldCheck, 
  Activity, 
  Settings, 
  Plus 
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore'; 
import { cn } from '@/lib/utils';

const baseMenuItems = [
  { name: 'Explore', icon: LayoutGrid, path: '/dashboard' },
  { name: 'Showcase', icon: Globe, path: '/dashboard/showcase' }, 
  { name: 'Verify', icon: ShieldCheck, path: '/dashboard/verify' },
  { name: 'Activity', icon: Activity, path: '/dashboard/activity' },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export function Sidebar() {
  const { isSidebarOpen } = useUIStore();
  const pathname = usePathname();
  const { user } = useAuthStore(); 

  const menuItems = baseMenuItems.map((item) => {
    if (item.name === 'Showcase') {
      return { ...item, path: `/dashboard/showcase/${user?.walletAddress || ''}` };
    }
    return item;
  });

  const mobileMenuItems = [
    menuItems[0], // Explore
    menuItems[1], // Showcase
    menuItems[3], // Activity
    menuItems[4], // Settings
  ];

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        className={cn(
          "hidden md:flex min-h-screen bg-background border-r border-border flex-col sticky top-0 shrink-0",
          isSidebarOpen ? "w-64" : "w-18"
        )}
      >
        <div className="p-3 mt-8 flex justify-center">
          <Link href="/dashboard/mint" className="w-full">
            <button 
              className={cn(
                "flex items-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-md",
                isSidebarOpen ? "w-full py-2 px-3 justify-start" : "ml-1 w-10 h-10 justify-center"
              )}
            >
              <Plus className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="ml-3 font-medium">Mint Image</span>}
            </button>
          </Link>
        </div>

        <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            // FIX APPLIED HERE: Showcase er jonno ekdom exact match check kora hocche
            const isActive = item.name === 'Explore' 
              ? pathname === '/dashboard' 
              : item.name === 'Showcase'
                ? pathname === item.path // <-- Shudhu nijer wallet holei active hobe!
                : pathname === item.path || pathname.startsWith(`${item.path}/`);
              
            return (
              <Link key={item.name} href={item.path}>
                <div
                  className={cn(
                    "flex items-center rounded-lg cursor-pointer group relative",
                    isSidebarOpen ? "py-2.5 px-3" : "w-10 h-10 mx-auto justify-center",
                    isActive 
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground  hover:bg-secondary/90 dark:hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={cn("shrink-0 w-5 h-5", isActive ? "text-primary" : "")} />
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm font-medium truncate">
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* --- MOBILE NAV --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/50 flex items-center justify-around pb-safe pt-2 px-2 h-16">
        
        {mobileMenuItems.slice(0, 2).map((item) => {
          // FIX APPLIED HERE TOO
          const isActive = item.name === 'Explore' 
            ? pathname === '/dashboard' 
            : item.name === 'Showcase'
              ? pathname === item.path // <-- Shudhu nijer wallet holei active hobe!
              : pathname === item.path || pathname.startsWith(`${item.path}/`);
            
          return (
            <Link key={item.name} href={item.path} className="flex flex-col items-center justify-center w-16 gap-1">
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.name}
              </span>
            </Link>
          );
        })}

        <Link href="/dashboard/mint">
          <button className="relative -top-1 flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full hover:bg-primary/80">
            <Plus className="w-6 h-6" />
          </button>
        </Link>

        {mobileMenuItems.slice(2, 4).map((item) => {
          // FIX APPLIED HERE TOO
          const isActive = item.name === 'Explore' 
            ? pathname === '/dashboard' 
            : item.name === 'Showcase'
              ? pathname === item.path // <-- Shudhu nijer wallet holei active hobe!
              : pathname === item.path || pathname.startsWith(`${item.path}/`);
            
          return (
            <Link key={item.name} href={item.path} className="flex flex-col items-center justify-center w-16 gap-1">
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}