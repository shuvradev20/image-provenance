'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Globe, ShieldCheck, History, Settings, Plus } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { SettingsPopover } from '@/components/sections/settings/SettingsPopover';

const baseMenuItems = [
  { name: 'Explore', icon: LayoutGrid, path: '/dashboard' },
  { name: 'Showcase', icon: Globe, path: '/dashboard/showcase' },
  { name: 'Verify', icon: ShieldCheck, path: '/verify', isExternal: true },
  { name: 'Activity', icon: History, path: '/dashboard/activity' },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export function Sidebar() {
  const { isSidebarOpen } = useUIStore();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isFullyVerified = user?.walletAddress && user?.kycStatus === 'verified';

  const menuItems = baseMenuItems.map((item) => {
    if (item.name === 'Showcase') {
      return { 
        ...item, 
        path: isFullyVerified 
          ? `/dashboard/showcase/${user.walletAddress}` 
          : '/dashboard/showcase' 
      };
    }
    return item;
  });

  const mobileMenuItems = [
    menuItems[0], // Explore
    menuItems[1], // Showcase
    menuItems[3], // Activity
    menuItems[4], // Settings
  ];

  const checkIsActive = (item: typeof baseMenuItems[number]) => {
    if (item.name === 'Explore') return pathname === '/dashboard';
    if (item.name === 'Showcase') return pathname.startsWith('/dashboard/showcase');
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex h-screen shrink-0 bg-background border-r border-border flex-col select-none overflow-hidden z-30",
          isSidebarOpen ? "w-60" : "w-19"
        )}
      >
        <div className="p-3 mt-6 flex justify-center">
          <Link href="/dashboard/mint" className="w-full flex justify-center">
            <button
              title={!isSidebarOpen ? "Mint Image" : undefined}
              className={cn(
                "cursor-pointer flex items-center bg-primary text-primary-foreground rounded-lg hover:opacity-90 shadow-sm h-10 transition-colors duration-150",
                isSidebarOpen ? "w-full px-3 justify-start" : "w-10 h-10 justify-center p-0"
              )}
            >
              <Plus className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="ml-3 font-medium text-sm truncate">Mint Image</span>}
            </button>
          </Link>
        </div>

        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = checkIsActive(item);

            const content = isSidebarOpen ? (
              <div
                className={cn(
                  "rounded-lg cursor-pointer group relative transition-colors duration-150 flex items-center py-2 px-3 w-full",
                  isActive
                    ? "bg-zinc-200/80 dark:bg-zinc-800 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-200/80 dark:hover:bg-zinc-800"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors duration-150",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  strokeWidth={item.name === 'Settings' ? 1.5 : 1}
                />
                <span className="ml-3 text-sm font-medium truncate">
                  {item.name}
                </span>
              </div>
            ) : (
              <div title={item.name} className="flex flex-col items-center justify-center cursor-pointer group w-full py-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-150",
                    isActive
                      ? "bg-zinc-200/80 dark:bg-zinc-800 text-foreground"
                      : "text-muted-foreground group-hover:bg-zinc-200/80 dark:group-hover:bg-zinc-800 group-hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors duration-150",
                      isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                    strokeWidth={item.name === 'Settings' ? 1.5 : 1}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-normal leading-none truncate w-full text-center mt-1 transition-colors duration-150",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.name}
                </span>
              </div>
            );

            if (item.name === 'Settings') {
              return (
                <SettingsPopover key={item.name}>
                  <button className="w-full text-left outline-none">{content}</button>
                </SettingsPopover>
              );
            }

            return (
              <Link 
                key={item.name} 
                href={item.path}
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                className="block"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background backdrop-blur-md border-t border-border flex items-center justify-around pb-safe pt-2 px-2 h-14">
        {mobileMenuItems.slice(0, 2).map((item) => {
          const isActive = checkIsActive(item);
          return (
            <Link 
              key={item.name} 
              href={item.path}
              target={item.isExternal ? "_blank" : undefined}
              rel={item.isExternal ? "noopener noreferrer" : undefined}
              className="flex flex-col items-center justify-center w-16 gap-1"
            >
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")} strokeWidth={1} />
              <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {item.name}
              </span>
            </Link>
          );
        })}

        <Link href="/dashboard/mint">
          <button className="relative -top-1 flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full hover:opacity-90 shadow-md">
            <Plus className="w-6 h-6" />
          </button>
        </Link>
        
        {mobileMenuItems.slice(2, 4).map((item) => {
          const isActive = checkIsActive(item);
          const mobileContent = (
            <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer">
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")} />
              <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {item.name}
              </span>
            </div>
          );

          if (item.name === 'Settings') {
            return (
              <SettingsPopover key={item.name}>
                {mobileContent}
              </SettingsPopover>
            );
          }

          return (
            <Link 
              key={item.name} 
              href={item.path}
              target={item.isExternal ? "_blank" : undefined}
              rel={item.isExternal ? "noopener noreferrer" : undefined}
            >
              {mobileContent}
            </Link>
          );
        })}
      </nav>
    </>
  );
}