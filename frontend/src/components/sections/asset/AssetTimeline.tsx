"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Minus, ExternalLink } from "lucide-react";

interface AssetTimelineProps {
    history: any[];
}

export default function AssetTimeline({ history }: AssetTimelineProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const renderEventDetails = (event: any) => {
        const wallet = event.actor || "0x0000000000000000000000000000000000000000";
        const shortWallet = `${wallet.slice(0, 8)}…${wallet.slice(-4)}`;
        
        let actionText = "";
        switch (event.action) {
            case 'minted': actionText = "The asset was Minted by"; break;
            case 'transferred': actionText = "Ownership was Transferred to"; break;
            case 'metadata_updated': actionText = "Metadata was updated by"; break;
            case 'burned': actionText = "The asset was destroyed by"; break;
            default: actionText = "Interacted by";
        }

        return (
            <div className="bg-muted/40 p-4 flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">{actionText}</p>
                <p className="font-mono text-sm text-foreground truncate">{shortWallet}</p>
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="space-y-2 mb-8">
                <h3 className="text-lg font-semibold text-foreground">Activity History</h3>
                <hr className="border-border" />
            </div>
            <div className="space-y-6">
                {history.map((event, index) => {
                    const isExpanded = expandedIndex === index;
                    const displayAction = event.action.replace('_', ' ');
                    
                    return (
                        <div key={index} className="relative pl-10">
                            <div className="absolute left-0.75 top-2.5 w-2.5 h-2.5 rounded-full border-2 border-foreground/30 bg-background z-20"></div>
                            <div className={`absolute left-1.75 top-7.5 bottom-px w-px bg-border transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}></div>
                            
                            <div 
                                className="flex justify-between items-center cursor-pointer group py-1"
                                onClick={() => toggleExpand(index)}
                            >
                                <span className="text-sm font-medium text-foreground capitalize tracking-tight group-hover:text-primary transition-colors">
                                    {displayAction}
                                </span>
                                <div className="flex pt-1 items-center gap-5">
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(event.timestamp), "MMM d, yyyy HH:mm")}
                                    </span>
                                    <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>

                            <div 
                                className={`grid transition-all duration-300 ease-in-out ${
                                    isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="rounded-xl border border-border overflow-hidden flex flex-col">
                                        {renderEventDetails(event)}

                                        <div className="bg-background p-4 border-t border-border">
                                            <span className="text-sm text-muted-foreground">
                                                Transaction Hash
                                            </span>
                                            <p className="font-mono text-[13px] text-foreground truncate mt-1">
                                                {event.transactionHash}
                                            </p>

                                            <a 
                                                href={`https://sepolia.arbiscan.io/tx/${event.transactionHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase text-primary hover:underline mt-4"
                                            >
                                                View on Arbiscan <ExternalLink className="w-3 h-3" />
                                            </a>
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