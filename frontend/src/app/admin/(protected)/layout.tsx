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
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <AdminTopbar />
      <div className="flex flex-1 pt-16 w-full">
        <AdminSidebar />
        <main className="flex-1 w-full p-4 md:p-8 pb-24 md:pb-8 overflow-x-hidden">
          {children}
        </main>
        <ReviewKycModal />
        <VerifiedUserModal />
      </div>
    </div>
  );
}