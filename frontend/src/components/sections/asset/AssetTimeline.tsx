"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Minus, ExternalLink, Copy, CopyCheck } from "lucide-react";

interface AssetTimelineProps {
  history: any[];
}

export default function AssetTimeline({ history }: AssetTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [copiedActor, setCopiedActor] = useState<string | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleCopy = (text: string, id: string, isActor = false) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isActor) {
      setCopiedActor(id);
      setTimeout(() => setCopiedActor(null), 2000);
    } else {
      setCopiedTx(id);
      setTimeout(() => setCopiedTx(null), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "0x0000...0000";
    return `${addr.slice(0, 16)}...${addr.slice(-6)}`;
  };

  const formatTxHash = (hash: string) => {
    if (!hash) return "0x0000...0000";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const renderEventDetails = (event: any, index: number) => {
    const wallet =
      event.action === "transferred"
        ? event.to
        : event.actor || "0x0000000000000000000000000000000000000000";

    let actionText = "";
    switch (event.action) {
      case "minted":
        actionText = "The asset was Minted by";
        break;
      case "transferred":
        actionText = "Ownership was Transferred to";
        break;
      case "metadata_updated":
        actionText = "Metadata was updated by";
        break;
      case "burned":
        actionText = "The asset was destroyed by";
        break;
      default:
        actionText = "Interacted by";
    }

    return (
      <div className="bg-zinc-200/30 dark:bg-zinc-900/50 p-3.5 flex flex-col gap-1 border-b border-border">
        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
          {actionText}
        </span>
        <div className="flex items-center justify-between gap-2 w-full">
          <span
            className="font-mono text-xs text-foreground tracking-tight block sm:hidden truncate"
            title={wallet}
          >
            {formatAddress(wallet)}
          </span>
          <span
            className="font-mono text-xs text-foreground tracking-tight hidden sm:block truncate min-w-0"
            title={wallet}
          >
            {wallet}
          </span>

          <button
            onClick={() => handleCopy(wallet, `actor-${index}`, true)}
            title="Copy wallet address"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0"
          >
            {copiedActor === `actor-${index}` ? (
              <CopyCheck className="w-3.5 h-3.5 text-foreground" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  if (!history || history.length === 0) {
    return (
      <div className="w-full pt-4">
        <div className="space-y-1 mb-4">
          <h3 className="text-sm font-medium text-foreground">Activity History</h3>
          <div className="h-px w-full bg-border" />
        </div>
        <p className="text-xs text-muted-foreground font-mono">No recorded on-chain history found.</p>
      </div>
    );
  }

  return (
    <div className="w-full pt-2 space-y-3">
      <div className="space-y-1 mb-6">
        <h3 className="text-sm font-medium text-foreground">Activity History</h3>
        <hr className="border-border mt-1" />
      </div>

      <div className="space-y-6">
        {history.map((event, index) => {
          const isExpanded = expandedIndex === index;
          const displayAction = event.action.replace("_", " ");
          const fullDateStr = event.timestamp ? new Date(event.timestamp).toLocaleString() : "";
          
          const formattedDateMobile = event.timestamp ? format(new Date(event.timestamp), "MMM d, yyyy") : "";
          const formattedDateDesktop = event.timestamp ? format(new Date(event.timestamp), "MMM d, yyyy HH:mm") : "";

          return (
            <div key={index} className="relative pl-8 sm:pl-10">
              <div className="absolute left-0.75 top-2.5 w-2.5 h-2.5 rounded-full border-2 border-foreground/30 bg-background z-20"></div>

              <div className={`absolute left-1.75 top-7.5 bottom-px w-px bg-border transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}></div>
              <div
                className="flex justify-between items-center cursor-pointer group py-1 select-none gap-2"
                onClick={() => toggleExpand(index)}
                title={`Click to toggle transaction details for ${displayAction}`}
              >
                <span className="text-xs sm:text-sm text-foreground capitalize tracking-tight group-hover:text-primary transition-colors shrink-0">
                  {displayAction}
                </span>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <span
                    className="font-mono text-[10px] text-muted-foreground block sm:hidden"
                    title={fullDateStr}
                  >
                    {formattedDateMobile}
                  </span>
                  <span
                    className="font-mono text-xs text-muted-foreground hidden sm:block"
                    title={fullDateStr}
                  >
                    {formattedDateDesktop}
                  </span>

                  <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {isExpanded ? <Minus className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                </div>
              </div>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="rounded-xl border border-border bg-card dark:bg-zinc-900/60 overflow-hidden flex flex-col text-xs">
                    {renderEventDetails(event, index)}

                    <div className="p-3.5 space-y-2.5">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
                          Transaction Hash
                        </span>
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span
                            className="font-mono text-xs text-foreground tracking-tight block sm:hidden truncate"
                            title={event.transactionHash}
                          >
                            {formatTxHash(event.transactionHash)}
                          </span>
                          <span
                            className="font-mono text-xs text-foreground tracking-tight hidden sm:block truncate min-w-0"
                            title={event.transactionHash}
                          >
                            {event.transactionHash || "N/A"}
                          </span>

                          <button
                            onClick={() => handleCopy(event.transactionHash, `tx-${index}`)}
                            title="Copy"
                            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0"
                          >
                            {copiedTx === `tx-${index}` ? (
                              <CopyCheck className="w-3.5 h-3.5 text-foreground" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="pt-1">
                        <a
                          href={`https://sepolia.arbiscan.io/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View transaction details on Arbiscan Block Explorer"
                          className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase text-primary hover:underline transition-all"
                        >
                          View on Arbiscan <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}