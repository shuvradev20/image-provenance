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

  const checkIsActive = (item: typeof baseMenuItems[number]) => {
    if (item.name === 'Explore') return pathname === '/dashboard';
    if (item.name === 'Showcase') return pathname === item.path;
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex h-screen shrink-0 bg-white dark:bg-[#1C1C1C] border-r border-border flex-col transition-colors duration-300",
          isSidebarOpen ? "w-64" : "w-18"
        )}
      >
        <div className="p-3 mt-8 flex justify-center">
          <Link href="/dashboard/mint" className="w-full">
            <button
              className={cn(
                "cursor-pointer flex items-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-md transition-all",
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
            const isActive = checkIsActive(item);

            const content = (
              <div
                className={cn(
                  "flex items-center rounded-lg cursor-pointer group relative transition-colors",
                  isSidebarOpen ? "py-2.5 px-3" : "w-10 h-10 mx-auto justify-center",
                  isActive
                    ? "bg-gray-200 dark:bg-[#2A2A2A] text-foreground"
                    : "text-foreground hover:bg-gray-200 dark:hover:bg-[#2A2A2A]"
                )}
              >
                <item.icon className={cn("shrink-0 w-5 h-5", isActive ? "text-primary" : "")} strokeWidth={item.name === 'Settings' ? 1.5 : 1} />
                {isSidebarOpen && (
                  <span className="ml-3 text-sm font-medium truncate">
                    {item.name}
                  </span>
                )}
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
              >
                {content}
              </Link>
            );
          })}
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1C1C1C] border-t border-border/50 flex items-center justify-around pb-safe pt-2 px-2 h-14 transition-colors duration-300">
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
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-foreground")} strokeWidth={1} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-foreground")}>
                {item.name}
              </span>
            </Link>
          );
        })}

        <Link href="/dashboard/mint">
          <button className="relative -top-1 flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full hover:bg-primary/80 shadow-md">
            <Plus className="w-6 h-6" />
          </button>
        </Link>
        
        {mobileMenuItems.slice(2, 4).map((item) => {
          const isActive = checkIsActive(item);
          const mobileContent = (
            <div className="flex flex-col items-center justify-center w-16 gap-1 cursor-pointer">
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-foreground")} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-foreground")}>
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