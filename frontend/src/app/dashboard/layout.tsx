import { Topbar } from '@/components/layout/user/topbar';
import { Sidebar } from '@/components/layout/user/sidebar';
import { AuthProvider } from '@/components/providers/auth-provider'


export default function CleanDashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AuthProvider>
      <div className="h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
        <div className="shrink-0 z-50">
          <Topbar />
        </div>
        <div className="flex flex-1 pt-16 overflow-hidden relative">
          <div className="shrink-0 h-full z-40">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/10">
            <div className="max-w-7xl mx-auto w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}