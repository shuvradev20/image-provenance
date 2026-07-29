import { Topbar } from '@/components/layout/user/topbar';
import { Sidebar } from '@/components/layout/user/sidebar';
import { AuthProvider } from '@/components/providers/auth-provider'


export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AuthProvider>
      <div className="h-screen w-full bg-background text-foreground flex flex-col font-sans overflow-hidden antialiased">
        <div className="shrink-0 z-50 h-16">
          <Topbar />
        </div>
        <div className="flex flex-1 overflow-hidden relative">
          <aside className="shrink-0 h-full z-40">
            <Sidebar />
          </aside>
          <main className="flex-1 overflow-y-auto bg-zinc-200/30 dark:bg-zinc-900/50 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}