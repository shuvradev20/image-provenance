"use client";

import { useState } from "react";
import { Copy, CopyCheck, ExternalLink } from "lucide-react";

interface AssetProofsProps {
  asset: any;
}

export default function AssetProofs({ asset }: AssetProofsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatHash = (hash: string) => {
    if (!hash) return "0x0000...0000";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const imageHash = asset.imageHash || asset.hash || "";

  return (
    <div className="bg-zinc-100/50 dark:bg-zinc-900 border border-border rounded-xl p-4 sm:p-5 w-full">
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
            Digital Fingerprint (Hash)
          </p>
          <div className="flex items-center justify-between gap-2 w-full">
            <span
              className="font-mono text-xs text-foreground tracking-tight block sm:hidden truncate"
              title={imageHash}
            >
              {formatHash(imageHash)}
            </span>
            <span
              className="font-mono text-xs text-foreground tracking-tight hidden sm:block truncate min-w-0"
              title={imageHash}
            >
              {imageHash || "N/A"}
            </span>

            <button
              onClick={() => handleCopy(imageHash)}
              title="Copy cryptographic image hash"
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0"
            >
              {copied ? (
                <CopyCheck className="w-3.5 h-3.5 text-foreground" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="w-full border-t border-border pt-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2.5">
            Decentralized Storage (IPFS)
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={asset.downloadUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              title="View original image on IPFS gateway"
              className="flex items-center justify-center gap-2 bg-zinc-200/30 dark:bg-zinc-900/50 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-border px-3 py-2 rounded-md text-xs font-mono text-foreground transition-all flex-1"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">Original Image</span>
            </a>
            <a
              href={asset.metadataLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              title="View raw IPFS JSON metadata"
              className="flex items-center justify-center gap-2 bg-zinc-200/30 dark:bg-zinc-900/50 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-border px-3 py-2 rounded-md text-xs font-mono text-foreground transition-all flex-1"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">Metadata JSON</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}