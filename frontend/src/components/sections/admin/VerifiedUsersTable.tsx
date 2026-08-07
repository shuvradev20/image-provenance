"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowRight, ShieldCheck, Users, Copy, CopyCheck, Loader2 } from "lucide-react";
import { useKycStore } from "@/store/useKycStore";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export function VerifiedUsersTable() {
  const {
    verifiedUsers: users,
    isLoadingVerified: isLoading,
    verifiedPagination: pagination,
    fetchVerifiedUsers,
    fetchUserDetailsForModal,
    setVerifiedModalOpen,
  } = useKycStore();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifiedUsers(1, 10);
  }, [fetchVerifiedUsers]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const truncateWallet = (address?: string) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchVerifiedUsers(newPage, pagination.limit);
    }
  };

  const handleViewClick = async (userId: string) => {
    toast.loading("Loading user profile...");
    await fetchUserDetailsForModal(userId);
    toast.dismiss();
    setVerifiedModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2.5 ">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground font-mono text-xs">
          Loading verified users...
        </p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="h-64 border border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-card dark:bg-zinc-900/60">
        <Users className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
        <p className="text-muted-foreground font-medium text-xs font-mono">
          No verified users yet
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
          Approve pending requests to see them here.
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
                  User Profile
                </th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">
                  Wallet Address
                </th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">
                  Date Verified
                </th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">
                  Status
                </th>
                <th className="py-3 px-4 font-medium text-right whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-foreground text-xs font-normal">
              {users.map((user, idx) => {
                const walletKey = `${user._id || idx}-wallet`;

                return (
                  <tr
                    key={user._id || idx}
                    className="hover:bg-zinc-200/80 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <span className="font-mono text-[11px] font-semibold text-emerald-500 uppercase">
                            {user.fullName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground text-xs leading-tight">
                            {user.fullName || "Unnamed User"}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          title={user.walletAddress || ""}
                          className="font-mono text-[10px] text-foreground tracking-tight hover:underline cursor-pointer"
                        >
                          {truncateWallet(user.walletAddress)}
                        </span>
                        {user.walletAddress && (
                          <button
                            title="Copy Address"
                            onClick={() =>
                              handleCopy(user.walletAddress, walletKey)
                            }
                            className="text-muted-foreground hover:text-foreground cursor-pointer transition"
                          >
                            {copiedKey === walletKey ? (
                              <CopyCheck className="w-3.5 h-3.5 text-foreground" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                      {user.kycVerifiedAt
                        ? format(new Date(user.kycVerifiedAt), "dd MMM, yyyy")
                        : "---"}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono border whitespace-nowrap inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleViewClick(user._id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded-md border border-border bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground transition cursor-pointer"
                      >
                        View Details{" "}
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="py-2 flex justify-between items-center">
          <div className="text-xs font-mono text-muted-foreground pl-1">
            Showing page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.totalUsers} total)
          </div>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pagination.currentPage - 1);
                  }}
                  className={
                    pagination.currentPage === 1
                      ? "pointer-events-none opacity-50 font-mono text-xs"
                      : "font-mono text-xs cursor-pointer"
                  }
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink href="#" isActive className="font-mono text-xs">
                  {pagination.currentPage}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pagination.currentPage + 1);
                  }}
                  className={
                    pagination.currentPage === pagination.totalPages
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