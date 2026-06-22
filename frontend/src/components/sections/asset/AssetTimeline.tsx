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

    // Helper function to dynamically generate friendly text
    const renderEventDescription = (event: any) => {
        const wallet = event.actor || "0x0000000000000000";
        // Standard Web3 format: 0x1234...abcd
        const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

        // Removed the isDestructive logic to keep all wallets the same color
        const StyledWallet = ({ address }: { address: string }) => (
            <span className="font-mono px-1 py-0.5 font-medium text-primary">
                {address}
            </span>
        );

        // Removed the trailing periods (.) at the end of every sentence
        switch (event.action) {
            case 'minted':
                return <>The asset was originally minted by <StyledWallet address={shortWallet} /></>;
                
            case 'transferred':
                if (event.from) {
                    const shortFrom = `${event.from.slice(0, 6)}...${event.from.slice(-4)}`;
                    return <>Ownership was transferred from <StyledWallet address={shortFrom} /> to <StyledWallet address={shortWallet} /></>;
                }
                return <>Ownership was transferred to a new wallet: <StyledWallet address={shortWallet} /></>;
                
            case 'metadata_updated':
            case 'edited': 
                return <>The asset's details (metadata) were updated by <StyledWallet address={shortWallet} /></>;
                
            case 'burned':
                return <>The asset was permanently destroyed (burned) by <StyledWallet address={shortWallet} /></>;
                
            default:
                return <>The asset was interacted with by <StyledWallet address={shortWallet} /></>;
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-[18px] font-semibold mb-8 text-foreground">Activity History</h3>
            
            <div className="relative">
                {/* Fixed Professional Vertical Line */}
                <div className="absolute left-[7px] top-2 bottom-4 w-[2px] bg-zinc-800"></div>

                <div className="space-y-6">
                    {history.map((event, index) => {
                        const isExpanded = expandedIndex === index;
                        
                        // Overwrite 'metadata_updated' with 'Edited' for user-friendly display
                        const displayAction = event.action === 'metadata_updated' ? 'Edited' : event.action.replace('_', ' ');
                        
                        return (
                            <div key={index} className="relative pl-10">
                                {/* Dot */}
                                <div className="absolute left-1 top-1.5 w-[10px] h-[10px] rounded-full bg-primary border-2 border-background shadow-sm"></div>
                                
                                {/* Header / Trigger */}
                                <div 
                                    className="flex justify-between items-center cursor-pointer group py-1"
                                    onClick={() => toggleExpand(index)}
                                >
                                    <span className="text-[15px] font-medium text-foreground capitalize tracking-tight group-hover:text-primary transition-colors">
                                        {displayAction}
                                    </span>
                                    <div className="flex items-center gap-5">
                                        <span className="text-[13px] text-muted-foreground font-mono">
                                            {format(new Date(event.timestamp), "MMM d, yyyy HH:mm")}
                                        </span>
                                        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                                            {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Smooth Animated Dropdown Box */}
                                <div 
                                    className={`grid transition-all duration-300 ease-in-out ${
                                        isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
                                    }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="bg-zinc-900/80 rounded-xl p-5 border border-zinc-800/80">
                                            
                                            {/* Human-readable Description */}
                                            <p className="text-[14px] text-zinc-300 leading-relaxed mb-4">
                                                {renderEventDescription(event)}
                                            </p>

                                            {/* Divider Line */}
                                            <div className="h-px bg-zinc-800 w-full mb-4" />
                                            
                                            {/* Transaction Details */}
                                            <div className="flex flex-col gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">
                                                        Transaction Hash
                                                    </span>
                                                    <span className="font-mono text-[13px] truncate text-zinc-400 break-all">
                                                        {event.transactionHash}
                                                    </span>
                                                </div>

                                                {/* View on Arbiscan Link (No heavy background) */}
                                                <a 
                                                    href={`https://sepolia.arbiscan.io/tx/${event.transactionHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-[14px] font-medium text-primary hover:text-primary/80 transition-colors w-fit group/link mt-1"
                                                >
                                                    View on Arbiscan 
                                                    <ExternalLink className="w-4 h-4 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
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
        </div>
    );
}