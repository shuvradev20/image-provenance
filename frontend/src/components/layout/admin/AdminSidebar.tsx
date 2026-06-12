'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock,
  ShieldCheck, 
  Users
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAdminStore } from '@/store/useAdminStore';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const { isSidebarOpen } = useUIStore();
  const { admin } = useAdminStore();
  const pathname = usePathname();

  // Role er upar vitti kore menu items
  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Pending KYC', icon: Clock, path: '/admin/pending-kyc' },
    { name: 'Verified Users', icon: ShieldCheck, path: '/admin/users' },
    // Shudhu superAdmin holei ei menu ta asbe
    ...(admin?.role === 'superAdmin' ? [{ name: 'Admin Management', icon: Users, path: '/admin/admins' }] : []),
  ];

  return (
    <>
      <aside
        className={cn(
            "hidden md:flex h-screen bg-background border-r border-border flex-col sticky top-0 shrink-0",
            isSidebarOpen ? "w-64" : "w-18"
        )}
      >
        <div className="flex-1 px-3 py-6 mt-16 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center rounded-lg cursor-pointer group relative",
                    isSidebarOpen ? "py-2.5 px-3 mb-2" : "w-10 h-10 mx-auto justify-center mb-2",
                    isActive 
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/90 dark:hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={cn("shrink-0 w-5 h-5", isActive ? "text-primary" : "")} />
                  {isSidebarOpen && (
                      <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
                          {item.name}
                      </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/50 flex items-center justify-around pb-safe pt-2 px-2 h-16">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link key={item.path} href={item.path} className="flex flex-col items-center justify-center w-16 gap-1">
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px] font-medium text-center", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}