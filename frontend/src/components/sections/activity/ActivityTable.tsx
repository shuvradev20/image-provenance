"use client";

import React, { useState } from "react";
import { Copy, ExternalLink, ArrowRight, CopyCheck } from "lucide-react";
import { ActivityTableSkeleton } from "./ActivitySkeleton";

interface ActivityTableProps {
  logs: any[];
  pagination: any;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  logs,
  pagination,
  currentTab,
  onTabChange,
  onPageChange,
  isLoading,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (isLoading) {
    return <ActivityTableSkeleton />;
  }

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const truncate = (str?: string) => {
    if (!str) return "---";
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  const getMethodBadge = (eventType: string) => {
    const badgeStyles: Record<string, string> = {
      UserRegistered: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50",
      ImageMinted: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50",
      MetadataUpdated: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50",
      ImageTransferred: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50",
      ImageBurned: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50",
    };

    const defaultStyle = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

    return (
      <span className={`px-2.5 py-0.5 rounded-md text-xs font-normal border transition-colors whitespace-nowrap ${badgeStyles[eventType] || defaultStyle}`}>
        {eventType || "Transfer"}
      </span>
    );
  };

  const formatAge = (timestamp?: string | number) => {
    if (!timestamp) return "---";

    const now = new Date().getTime();
    const past = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;

    return new Date(timestamp).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onTabChange("ALL")}
          className={`py-1.5 px-3 rounded-lg text-sm transition cursor-pointer border ${
            currentTab === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-transparent border-border hover:bg-muted/50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => onTabChange("MY_ACTIVITY")}
          className={`py-1.5 px-3 rounded-lg text-sm transition cursor-pointer border ${
            currentTab === "MY_ACTIVITY"
              ? "bg-primary text-primary-foreground"
              : "bg-transparent border-border hover:bg-muted/50"
          }`}
        >
          My Activity
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-muted">
          <table className="w-full text-left min-w-200">
            <thead className="bg-muted text-sm font-normal border-b border-border">
              <tr>
                <th className="py-3 px-4 font-normal whitespace-nowrap">Transaction Hash</th>
                <th className="py-3 px-4 font-normal whitespace-nowrap">Method</th>
                <th className="py-3 px-4 font-normal whitespace-nowrap">Block</th>
                <th className="py-3 px-4 font-normal whitespace-nowrap">Age</th>
                <th className="py-3 px-4 font-normal whitespace-nowrap">From</th>
                <th className="py-3 px-4 font-normal w-6 text-center"></th>
                <th className="py-3 px-4 font-normal whitespace-nowrap">To</th>
                <th className="py-3 px-4 font-normal whitespace-nowrap">Transaction Fee</th>
                <th className="py-3 px-4 font-normal text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-sans text-xs font-normal">
              {!logs || logs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 font-sans text-xs font-normal">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any, idx: number) => {
                  const targetAddress = log.targetUser || "0x6e044f9c";
                  const txKey = `${idx}-tx`;
                  const actorKey = `${idx}-actor`;
                  const targetKey = `${idx}-target`;

                  return (
                    <tr key={log._id || idx} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-xs font-normal whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground cursor-pointer">
                            {truncate(log.transactionHash)}
                          </span>
                          <button
                            onClick={() => handleCopy(log.transactionHash, txKey)}
                            className="text-foreground/50 hover:text-foreground cursor-pointer transition"
                          >
                            {copiedKey === txKey ? (
                              <CopyCheck className="w-3.5 h-3.5 text-foreground" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-normal whitespace-nowrap">
                        {getMethodBadge(log.eventType)}
                      </td>

                      <td className="py-3 px-4 text-xs font-normal text-foreground cursor-pointer whitespace-nowrap">
                        {log.blockNumber ? `${log.blockNumber}` : "---"}
                      </td>

                      <td className="py-3 px-4 text-xs font-normal text-foreground whitespace-nowrap">
                        {formatAge(log.blockTimestamp)}
                      </td>

                      <td className="py-3 px-4 text-xs font-normal whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-foreground cursor-pointer">
                            {truncate(log.actor)}
                          </span>
                          <button
                            onClick={() => handleCopy(log.actor, actorKey)}
                            className="text-foreground/50 hover:text-foreground cursor-pointer transition"
                          >
                            {copiedKey === actorKey ? (
                              <CopyCheck className="w-3.5 h-3.5 text-foreground" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-1 text-center text-xs font-normal whitespace-nowrap">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 mx-auto">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-normal whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-foreground cursor-pointer">
                            {truncate(targetAddress)}
                          </span>
                          <button
                            onClick={() => handleCopy(targetAddress, targetKey)}
                            className="text-foreground/50 hover:text-foreground cursor-pointer transition"
                          >
                            {copiedKey === targetKey ? (
                              <CopyCheck className="w-3.5 h-3.5 text-foreground" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-normal text-foreground whitespace-nowrap">
                        {log.transactionFee 
                          ? `${log.transactionFee} ETH` 
                          : log.gasUsed 
                          ? `${log.gasUsed} ETH` 
                          : "---"}
                      </td>

                      <td className="py-3 px-4 text-right text-xs font-normal whitespace-nowrap">
                        <a
                          href={
                            log.transactionHash
                              ? `https://sepolia.arbiscan.io/tx/${log.transactionHash}`
                              : "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal rounded border transition ${
                            !log.transactionHash
                              ? "pointer-events-none bg-muted text-muted-foreground border-border"
                              : "bg-muted hover:bg-muted/50 text-foreground border-border"
                          }`}
                        >
                          View on Arbiscan <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-sans">
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Page <strong className="text-slate-700 dark:text-slate-200">{pagination.currentPage}</strong> of{" "}
              <strong className="text-slate-700 dark:text-slate-200">{pagination.totalPages}</strong> ({pagination.totalLogs} total logs)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage === 1 || isLoading}
                onClick={() => onPageChange(pagination.currentPage - 1)}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Previous
              </button>
              <button
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => onPageChange(pagination.currentPage + 1)}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};