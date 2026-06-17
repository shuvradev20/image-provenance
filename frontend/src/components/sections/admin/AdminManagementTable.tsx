"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { Trash2, ShieldAlert, Shield, UserCog } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { toast } from "sonner";
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious 
} from "@/components/ui/pagination";

export function AdminManagementTable() {
    const { 
        admin: loggedInAdmin,
        adminsList, 
        isLoadingAdmins, 
        adminPagination, 
        fetchAdmins, 
        removeAdmin 
    } = useAdminStore();

    useEffect(() => {
        fetchAdmins(1, 10);
    }, [fetchAdmins]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= adminPagination.totalPages) {
            fetchAdmins(newPage, adminPagination.limit);
        }
    };

    const handleDelete = async (adminId: string, adminName: string) => {
        if (window.confirm(`Are you absolutely sure you want to delete ${adminName}? This action cannot be undone.`)) {
            const toastId = toast.loading("Removing admin access...");
            try {
                await removeAdmin(adminId);
                toast.success(`Admin ${adminName} has been removed successfully.`, { id: toastId });
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to delete admin", { id: toastId });
            }
        }
    };

    if (isLoadingAdmins) {
        return (
            <div className="h-125 border border-border rounded-xl flex items-center justify-center bg-muted/10 animate-pulse">
                <p className="text-muted-foreground">Loading administrators...</p>
            </div>
        );
    }

    if (adminsList.length === 0) {
        return (
            <div className="h-125 border border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/10">
                <UserCog className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground text-lg font-medium">No admins found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Admin Profile</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Joined Date</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {adminsList.map((adminUser) => {
                                const isSelf = loggedInAdmin?._id === adminUser._id;

                                return (
                                    <tr key={adminUser._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${adminUser.role === 'superAdmin' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                                    <span className="font-semibold text-sm uppercase">
                                                        {adminUser.fullName?.charAt(0) || "A"}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground flex items-center gap-2">
                                                        {adminUser.fullName}
                                                        {isSelf && <span className="text-[10px] bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.5 rounded-sm tracking-wider uppercase">You</span>}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{adminUser.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            {adminUser.role === 'superAdmin' ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[11px] font-medium border border-indigo-500/20 uppercase tracking-wide">
                                                    <ShieldAlert className="w-3 h-3" />
                                                    Super Admin
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[11px] font-medium border border-blue-500/20 uppercase tracking-wide">
                                                    <Shield className="w-3 h-3" />
                                                    Admin
                                                </div>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {adminUser.createdAt ? format(new Date(adminUser.createdAt), "dd MMM, yyyy") : "N/A"}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(adminUser._id, adminUser.fullName)}
                                                disabled={isSelf}
                                                className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-md transition-colors border ${
                                                    isSelf 
                                                    ? "bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800 cursor-not-allowed" 
                                                    : "text-red-600 bg-red-50 hover:bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:border-red-900/30 cursor-pointer"
                                                }`}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1.5" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {adminPagination.totalPages > 1 && (
                <div className="py-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground pl-2">
                        Showing page {adminPagination.currentPage} of {adminPagination.totalPages} ({adminPagination.totalAdmins} total)
                    </div>
                    <Pagination className="justify-end w-auto mx-0">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(adminPagination.currentPage - 1);
                                    }}
                                    className={adminPagination.currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                            
                            <PaginationItem>
                                <PaginationLink href="#" isActive>
                                    {adminPagination.currentPage}
                                </PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(adminPagination.currentPage + 1);
                                    }}
                                    className={adminPagination.currentPage === adminPagination.totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}