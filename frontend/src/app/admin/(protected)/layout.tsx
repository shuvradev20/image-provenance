import { AdminSidebar } from "@/components/layout/admin/AdminSidebar";
import { AdminTopbar } from "@/components/layout/admin/AdminTopbar";
import { ReviewKycModal } from "@/components/sections/admin/ReviewKycModal";
import { VerifiedUserModal } from "@/components/sections/admin/VerifiedUserModal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col font-sans overflow-hidden antialiased">
      <div className="shrink-0 z-50 h-16">
        <AdminTopbar />
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        <aside className="shrink-0 h-full z-40">
          <AdminSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto bg-zinc-200/30 dark:bg-zinc-900/50 p-4 md:p-6 lg:p-8 transition-colors duration-200">
          <div className="max-w-7xl pb-14 md:pb-8 mx-auto w-full h-auto">
            {children}
          </div>
        </main>
        <ReviewKycModal />
        <VerifiedUserModal />
      </div>
    </div>
  );
}