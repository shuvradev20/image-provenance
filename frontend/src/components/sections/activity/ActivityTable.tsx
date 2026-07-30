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
    let styleConfig = {
      color: "var(--status-success)",
      bg: "color-mix(in oklch, var(--status-success) 12%, transparent)",
      border: "color-mix(in oklch, var(--status-success) 25%, transparent)",
    };

    if (eventType === "MetadataUpdated") {
      styleConfig = {
        color: "var(--status-warning)",
        bg: "color-mix(in oklch, var(--status-warning) 12%, transparent)",
        border: "color-mix(in oklch, var(--status-warning) 25%, transparent)",
      };
    } else if (eventType === "ImageBurned") {
      styleConfig = {
        color: "var(--status-error)",
        bg: "color-mix(in oklch, var(--status-error) 12%, transparent)",
        border: "color-mix(in oklch, var(--status-error) 25%, transparent)",
      };
    } else if (eventType === "ImageTransferred") {
      styleConfig = {
        color: "oklch(0.65 0.20 290)",
        bg: "color-mix(in oklch, oklch(0.65 0.20 290) 12%, transparent)",
        border: "color-mix(in oklch, oklch(0.65 0.20 290) 25%, transparent)",
      };
    } else if (eventType === "ImageMinted") {
      styleConfig = {
        color: "oklch(0.65 0.18 230)",
        bg: "color-mix(in oklch, oklch(0.65 0.18 230) 12%, transparent)",
        border: "color-mix(in oklch, oklch(0.65 0.18 230) 25%, transparent)",
      };
    }

    return (
      <span
        style={{
          color: styleConfig.color,
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
        }}
        className="px-2 py-0.5 rounded-md text-[10px] font-mono border whitespace-nowrap inline-block"
      >
        {eventType || "Transfer"}
      </span>
    );
  };

  const formatCompactTime = (timestamp?: string | number) => {
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
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTabChange("ALL")}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
            currentTab === "ALL"
              ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
              : "bg-card dark:bg-zinc-900/60 text-muted-foreground border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800"
          }`}
        >
          All
        </button>
        <button
          onClick={() => onTabChange("MY_ACTIVITY")}
          className={`py-1.5 px-3.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
            currentTab === "MY_ACTIVITY"
              ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
              : "bg-card dark:bg-zinc-900/60 text-muted-foreground border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800"
          }`}
        >
          My Activity
        </button>
      </div>

      <div className="bg-card dark:bg-zinc-900/60 border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-muted">
          <table className="w-full text-left min-w-200">
            <thead className="bg-zinc-100/60 dark:bg-zinc-900/40 text-muted-foreground text-[10px] font-mono tracking-wider uppercase border-b border-border">
              <tr>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Transaction Hash</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Method</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Block</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Age</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">From</th>
                <th className="py-3 px-4 font-medium w-6 text-center"></th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">To</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Transaction Fee</th>
                <th className="py-3 px-4 font-medium text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-foreground text-xs font-normal">
              {!logs || logs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-muted-foreground font-mono text-xs">
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
                    <tr key={log._id || idx} className="hover:bg-zinc-200/80 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span title={log.transactionHash || ""} className="font-mono text-[10px] text-foreground tracking-tight hover:underline cursor-pointer">
                            {truncate(log.transactionHash)}
                          </span>
                          <button
                            title="Copy"
                            onClick={() => handleCopy(log.transactionHash, txKey)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer transition"
                          >
                            {copiedKey === txKey ? (
                              <CopyCheck className="w-3.5 h-3.5 text-foreground" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getMethodBadge(log.eventType)}
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px] text-foreground whitespace-nowrap">
                        {log.blockNumber ? `${log.blockNumber}` : "---"}
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                        <span title={log.blockTimestamp ? new Date(log.blockTimestamp).toLocaleString() : ""}>
                          {formatCompactTime(log.blockTimestamp)}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span title={log.actor || ""} className="font-mono text-[10px] text-foreground tracking-tight cursor-pointer hover:underline">
                            {truncate(log.actor)}
                          </span>
                          <button
                            title="Copy"
                            onClick={() => handleCopy(log.actor, actorKey)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer transition"
                          >
                            {copiedKey === actorKey ? (
                              <CopyCheck className="w-3.5 h-3.5 text-foreground" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-1 text-center whitespace-nowrap">
                        <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground flex items-center justify-center border border-border mx-auto">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span title={targetAddress} className="font-mono text-[10px] text-foreground tracking-tight cursor-pointer hover:underline">
                            {truncate(targetAddress)}
                          </span>
                          <button
                            title="Copy"
                            onClick={() => handleCopy(targetAddress, targetKey)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer transition"
                          >
                            {copiedKey === targetKey ? (
                              <CopyCheck className="w-3.5 h-3.5 text-foreground" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[10px] text-foreground whitespace-nowrap">
                        {log.transactionFee 
                          ? `${log.transactionFee} ETH` 
                          : log.gasUsed 
                          ? `${log.gasUsed} ETH` 
                          : "---"}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <a
                          title="View on Arbiscan Explorer"
                          href={
                            log.transactionHash
                              ? `https://sepolia.arbiscan.io/tx/${log.transactionHash}`
                              : "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded-md border transition ${
                            !log.transactionHash
                              ? "pointer-events-none bg-muted text-muted-foreground border-border"
                              : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground border-border"
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-border bg-zinc-100/50 dark:bg-zinc-900/40 font-mono text-[10px]">
            <span className="text-muted-foreground text-center sm:text-left">
              Page <strong className="text-foreground">{pagination.currentPage}</strong> of{" "}
              <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.totalLogs} total logs)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage === 1 || isLoading}
                onClick={() => onPageChange(pagination.currentPage - 1)}
                className="px-3 py-1 bg-card dark:bg-zinc-900 border border-border text-foreground rounded-md disabled:opacity-50 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => onPageChange(pagination.currentPage + 1)}
                className="px-3 py-1 bg-card dark:bg-zinc-900 border border-border text-foreground rounded-md disabled:opacity-50 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition cursor-pointer"
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