"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Flame, Copy, CopyCheck, AlertTriangle, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifyStatus } from "./VerifyContainer";

import AssetProofs from "@/components/sections/asset/AssetProofs";
import AssetTimeline from "@/components/sections/asset/AssetTimeline";

interface VerifyResultRightProps {
  status: VerifyStatus;
  resultData: any;
  onReset: () => void;
}

export default function VerifyResultRight({ status, resultData, onReset }: VerifyResultRightProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const asset = resultData?.asset;
  const uploadedFileDetails = resultData?.uploadedFileDetails;

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // SCENARIO C: UNREGISTERED
  if (status === 'unregistered') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in">
        <div className="w-full pb-4 border-b border-border">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Unknown Asset
                </h1>
                <Badge variant="secondary" className="bg-destructive/10 text-destructive border-transparent text-[10px] font-mono py-0.5 px-2">
                  <XCircle className="w-3 h-3 mr-1" /> Unregistered
                </Badge>
              </div>
              <span className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider block">
                NO CATEGORY
              </span>
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Technical Details</h3>
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Format</span>
              <span className="text-xs font-mono text-foreground uppercase">{uploadedFileDetails?.fileType || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">File Size</span>
              <span className="text-xs font-mono text-foreground">
                {uploadedFileDetails?.fileSize ? (uploadedFileDetails.fileSize / 1024 / 1024).toFixed(2) : '0.00'} MB
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-5 bg-card border border-border rounded-xl flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-foreground">Asset Not Protected</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This image is not registered on the ProveNode blockchain. Secure your digital rights now.
            </p>
          </div>
          <div className="flex gap-2.5 mt-1 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onReset} className="flex-1 sm:flex-none">Scan Another</Button>
            <Link href="/dashboard/mint" className="flex-1 sm:flex-none">
              <Button size="sm" className="w-full">Mint Image</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SCENARIO A & B: AUTHENTIC / EDITED
  if (!asset) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* 1. Asset Header & Description */}
      <div className="w-full pb-4 border-b border-border">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold tracking-tight text-foreground capitalize">
                  {asset.title}
                </h1>
                {asset.status === 'burned' ? (
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive text-[10px] font-mono py-0.5 px-2">
                    <Flame className="w-3 h-3 mr-1" /> Burned
                  </Badge>
                ) : status === 'edited' ? (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-mono py-0.5 px-2">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Edited
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-[10px] font-mono py-0.5 px-2">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Authentic
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider block">
                {asset.assetCategory?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <p className="text-foreground/80 leading-relaxed text-xs whitespace-pre-wrap">
            {asset.description}
          </p>

          {asset.tags && asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {asset.tags.map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] text-muted-foreground bg-muted/20 px-2 py-0.5 border-border rounded-md font-mono">
                  #{tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Technical Metadata */}
      <div className="w-full space-y-2.5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Technical Details</h3>
        {asset.fileDetails && (
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Resolution</span>
              <span className="font-mono text-foreground">{asset.fileDetails.width} × {asset.fileDetails.height} px</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Format</span>
              <span className="font-mono text-foreground uppercase">{asset.fileDetails.fileType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Original File Size</span>
              <span className="font-mono text-foreground">{(asset.fileDetails.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Ownership Card */}
      <div className="bg-card border border-border rounded-xl p-4 w-full space-y-3">
        <div>
          <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Minted By</p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-foreground truncate" title={asset.uploader}>
              {asset.uploader || "0x0000000000000000000000000000000000000000"}
            </p>
            <button 
              onClick={() => handleCopy(asset.uploader, 'uploader')} 
              title="Copy wallet address"
              className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
            >
              {copiedField === 'uploader' ? <CopyCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Current Owner</p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-foreground truncate" title={asset.currentOwner}>
              {asset.status === 'burned' ? "0x0000000000000000000000000000000000000000" : (asset.currentOwner || "0x0000000000000000000000000000000000000000")}
            </p>
            {asset.status !== 'burned' && (
              <button 
                onClick={() => handleCopy(asset.currentOwner, 'owner')} 
                title="Copy owner address"
                className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
              >
                {copiedField === 'owner' ? <CopyCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Mismatch Notice for Edited Status */}
      {status === 'edited' && (
        <div className="w-full p-3.5 rounded-xl flex items-start gap-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            <strong className="font-semibold">Hash Mismatch:</strong> The file payload has been modified after registration. Use the comparison slider on the workspace to review alterations.
          </p>
        </div>
      )}

      {/* 5. Asset Proofs */}
      <AssetProofs asset={asset} />

      {/* 6. Asset Timeline */}
      {asset.history && asset.history.length > 0 && (
        <AssetTimeline history={asset.history} />
      )}
    </div>
  );
}