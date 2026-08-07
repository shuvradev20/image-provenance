"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ArrowRight, FileText, Clock, Copy, CopyCheck } from "lucide-react";
import { useKycStore } from "@/store/useKycStore";
import { toast } from "sonner";

export function RecentKycTable() {
  const {
    recentUsers: users,
    fetchRecentKyc,
    fetchUserDetailsForModal,
    setPendingModalOpen,
  } = useKycStore();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentKyc();
  }, [fetchRecentKyc]);

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

  const handleReviewClick = async (userId: string) => {
    toast.loading("Loading user documents...");
    await fetchUserDetailsForModal(userId);
    toast.dismiss();
    setPendingModalOpen(true);
  };

  if (!users || users.length === 0) {
    return (
      <div className="h-64 border border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-card dark:bg-zinc-900/60">
        <FileText className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
        <p className="text-muted-foreground font-medium text-xs font-mono">
          No pending KYC requests
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
          You're all caught up!
        </p>
      </div>
    );
  }

  return (
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
                Date Applied
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
              const walletKey = `${idx}-wallet`;

              return (
                <tr
                  key={user._id || idx}
                  className="hover:bg-zinc-200/80 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{
                          backgroundColor:
                            "color-mix(in oklch, var(--status-warning, oklch(0.75 0.15 65)) 12%, transparent)",
                          borderColor:
                            "color-mix(in oklch, var(--status-warning, oklch(0.75 0.15 65)) 25%, transparent)",
                        }}
                        className="w-7 h-7 rounded-full border flex items-center justify-center shrink-0"
                      >
                        <span
                          style={{
                            color: "var(--status-warning, oklch(0.75 0.15 65))",
                          }}
                          className="font-mono text-[11px] font-semibold uppercase"
                        >
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
                          onClick={() => handleCopy(user.walletAddress, walletKey)}
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
                    {user.kycSubmittedAt
                      ? format(new Date(user.kycSubmittedAt), "dd MMM, yyyy")
                      : "---"}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      style={{
                        color: "var(--status-warning, oklch(0.75 0.15 65))",
                        backgroundColor:
                          "color-mix(in oklch, var(--status-warning, oklch(0.75 0.15 65)) 12%, transparent)",
                        borderColor:
                          "color-mix(in oklch, var(--status-warning, oklch(0.75 0.15 65)) 25%, transparent)",
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono border whitespace-nowrap inline-flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleReviewClick(user._id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded-md border border-border bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground transition cursor-pointer"
                    >
                      Review <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}