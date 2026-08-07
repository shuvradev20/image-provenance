"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { Trash2, ShieldAlert, Shield, UserCog, Loader2 } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export function AdminManagementTable() {
  const {
    admin: loggedInAdmin,
    adminsList,
    isLoadingAdmins,
    adminPagination,
    fetchAdmins,
    removeAdmin,
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
    if (
      window.confirm(
        `Are you absolutely sure you want to delete ${adminName}? This action cannot be undone.`
      )
    ) {
      const toastId = toast.loading("Removing admin access...");
      try {
        await removeAdmin(adminId);
        toast.success(`Admin ${adminName} has been removed successfully.`, {
          id: toastId,
        });
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to delete admin",
          { id: toastId }
        );
      }
    }
  };

  if (isLoadingAdmins) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground font-mono text-xs">
          Loading administrators...
        </p>
      </div>
    );
  }

  if (!adminsList || adminsList.length === 0) {
    return (
      <div className="h-64 border border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-card dark:bg-zinc-900/60">
        <UserCog className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
        <p className="text-muted-foreground font-medium text-xs font-mono">
          No admins found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card dark:bg-zinc-900/60 border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-muted">
          <table className="w-full text-left min-w-180">
            <thead className="bg-zinc-100/60 dark:bg-zinc-900/40 text-muted-foreground text-[10px] font-mono tracking-wider uppercase border-b border-border">
              <tr>
                <th className="py-3 px-4 font-medium whitespace-nowrap">
                  Admin Profile
                </th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">
                  Role
                </th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">
                  Joined Date
                </th>
                <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-foreground text-xs font-normal">
              {adminsList.map((adminUser, idx) => {
                const isSelf = loggedInAdmin?._id === adminUser._id;

                return (
                  <tr
                    key={adminUser._id || idx}
                    className="hover:bg-zinc-200/80 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${
                            adminUser.role === "superAdmin"
                              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                          }`}
                        >
                          <span className="font-mono text-[11px] font-semibold uppercase">
                            {adminUser.fullName?.charAt(0) || "A"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground text-xs leading-tight flex items-center gap-1.5">
                            {adminUser.fullName || "Unnamed Admin"}
                            {isSelf && (
                              <span className="text-[9px] font-mono bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.2 rounded tracking-wider uppercase">
                                You
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {adminUser.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {adminUser.role === "superAdmin" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono border whitespace-nowrap inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                          <ShieldAlert className="w-3 h-3" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono border whitespace-nowrap inline-flex items-center gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                      {adminUser.createdAt
                        ? format(new Date(adminUser.createdAt), "dd MMM, yyyy")
                        : "---"}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleDelete(adminUser._id, adminUser.fullName)
                        }
                        disabled={isSelf}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded-md border transition ${
                          isSelf
                            ? "bg-zinc-100 text-zinc-400 border-border dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed opacity-50"
                            : "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 dark:text-red-400 cursor-pointer"
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
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
        <div className="py-2 flex justify-between items-center">
          <div className="text-xs font-mono text-muted-foreground pl-1">
            Showing page {adminPagination.currentPage} of{" "}
            {adminPagination.totalPages} ({adminPagination.totalAdmins} total)
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
                  className={
                    adminPagination.currentPage === 1
                      ? "pointer-events-none opacity-50 font-mono text-xs"
                      : "font-mono text-xs cursor-pointer"
                  }
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink href="#" isActive className="font-mono text-xs">
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
                  className={
                    adminPagination.currentPage === adminPagination.totalPages
                      ? "pointer-events-none opacity-50 font-mono text-xs"
                      : "font-mono text-xs cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}