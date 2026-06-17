import { AdminManagementTable } from "@/components/sections/admin/AdminManagementTable";
import { CreateAdminModal } from "@/components/sections/admin/CreateAdminModal";
import { AddAdminButton } from "@/components/sections/admin/AddAdminButton";

export default function AdminManagementPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Admin Management</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage system administrators and their access levels. Strictly for Super Admins.
                    </p>
                </div>
                <AddAdminButton /> 
            </div>
            
            <AdminManagementTable />
            <CreateAdminModal />
        </div>
    );
}