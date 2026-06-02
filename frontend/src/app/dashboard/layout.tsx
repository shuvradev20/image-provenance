import { Topbar } from '@/components/layout/topbar';
import { Sidebar } from '@/components/layout/sidebar';
import { AuthProvider } from '@/components/providers/auth-provider'


export default function CleanDashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Topbar />
        <div className="flex flex-1 pt-16 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/10 relative">
            <div className="max-w-7xl mx-auto w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}