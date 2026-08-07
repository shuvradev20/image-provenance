import { AdminManagementTable } from "@/components/sections/admin/AdminManagementTable";
import { CreateAdminModal } from "@/components/sections/admin/CreateAdminModal";
import { AddAdminButton } from "@/components/sections/admin/AddAdminButton";

export default function AdminManagementPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
                <AddAdminButton /> 
            </div>
            
            <AdminManagementTable />
            <CreateAdminModal />
        </div>
    );
}