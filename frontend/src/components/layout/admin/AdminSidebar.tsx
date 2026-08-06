'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, UserCheck, UserCog, UserCircle } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAdminStore } from '@/store/useAdminStore';
import { cn } from '@/lib/utils';
import { AdminDropdown } from './AdminDropdown';

export function AdminSidebar() {
  const { isSidebarOpen } = useUIStore();
  const { admin } = useAdminStore();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/admin/overview' },
    { name: 'Pending', icon: Clock, path: '/admin/pending-kyc' },
    { name: 'Users', icon: UserCheck, path: '/admin/users' },
    ...(admin?.role === 'superAdmin' ? [{ name: 'Admins', icon: UserCog, path: '/admin/admins' }] : []),
  ];

  const checkIsActive = (path: string) => {
    if (!pathname) return false;
    const normalizedPathname = pathname.replace(/\/$/, '') || '/';
    if (path === '/admin/overview') return normalizedPathname === '/admin/overview';
    return normalizedPathname === path || normalizedPathname.startsWith(`${path}/`);
  };

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex h-[calc(100vh-4rem)] shrink-0 bg-background border-r border-border flex-col select-none overflow-hidden z-30 sticky top-16 justify-between",
          isSidebarOpen ? "w-60" : "w-19"
        )}
      >
        <div className="flex-1 px-3 py-4 mt-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = checkIsActive(item.path);

            const content = isSidebarOpen ? (
              <div
                className={cn(
                  "rounded-lg cursor-pointer group relative transition-colors duration-150 flex items-center py-2 px-3 w-full",
                  isActive
                    ? "bg-zinc-200/80 dark:bg-zinc-800 text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-200/80 dark:hover:bg-zinc-800"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors duration-150",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  strokeWidth={1.5}
                />
                <span className="ml-3 text-sm truncate">{item.name}</span>
              </div>
            ) : (
              // Sidebar close thakle icon er niche text show korar jonno update kora hoyeche
              <div 
                title={item.name} 
                className="flex flex-col items-center justify-center cursor-pointer group w-full py-1"
              >
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
                    strokeWidth={1.5}
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

            return (
              <Link key={item.path} href={item.path} className="block">
                {content}
              </Link>
            );
          })}
        </div>

        <div className="p-3 shrink-0 border-t border-border/40">
          <AdminDropdown>
            <button className="w-full text-left outline-none">
              {isSidebarOpen ? (
                <div className="flex items-center pl-2 justify-between group cursor-pointer p-2 rounded-lg hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-colors duration-150">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="flex items-center justify-center text-muted-foreground group-hover:text-foreground">
                      <UserCircle className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-foreground truncate">
                        {admin?.fullName || 'Admin'}
                      </span>
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground capitalize truncate">
                        {admin?.role || 'Administrator'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Sidebar close thakle profile ero ek-e rokom design kora hoyeche
                <div 
                  title="Profile"
                  className="flex flex-col items-center justify-center cursor-pointer group w-full py-1"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-150 text-muted-foreground group-hover:bg-zinc-200/80 dark:group-hover:bg-zinc-800 group-hover:text-foreground">
                    <UserCircle className="w-5 h-5 shrink-0 transition-colors duration-150" />
                  </div>
                  <span className="text-[10px] font-normal leading-none truncate w-full text-center mt-1 transition-colors duration-150 text-muted-foreground group-hover:text-foreground">
                    Profile
                  </span>
                </div>
              )}
            </button>
          </AdminDropdown>
        </div>
      </aside>

      {/* Mobile nav height abar h-14 kore deya hoyeche */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around pb-safe pt-1 px-2 h-14">
        {menuItems.map((item) => {
          const isActive = checkIsActive(item.path);
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              title={item.name}
              className="flex flex-col items-center justify-center w-14 h-12 cursor-pointer gap-1"
            >
              <item.icon 
                className={cn(
                  "w-5 h-5 transition-colors duration-150", 
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )} 
                strokeWidth={1.5}
              />
              <span className={cn(
                "text-[10px] font-medium leading-none transition-colors duration-150",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}

        <AdminDropdown>
          <div 
            title="Profile"
            className="flex flex-col items-center justify-center w-14 h-12 cursor-pointer gap-1 group"
          >
            <UserCircle 
              className="w-5 h-5 transition-colors duration-150 text-muted-foreground group-hover:text-foreground" 
              strokeWidth={1.5} 
            />
            <span className="text-[10px] font-medium leading-none transition-colors duration-150 text-muted-foreground group-hover:text-foreground">
              Profile
            </span>
          </div>
        </AdminDropdown>
      </nav>
    </>
  );
}