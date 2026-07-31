"use client";

import { ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KycCalloutBannerProps {
  onStartKyc: () => void;
  isKycOpen: boolean;
}

export function KycCalloutBanner({ onStartKyc, isKycOpen }: KycCalloutBannerProps) {
  const warningTintStyle = {
    borderColor: `color-mix(in oklch, var(--status-warning) 30%, transparent)`,
    backgroundColor: `color-mix(in oklch, var(--status-warning) 8%, transparent)`,
    color: `var(--status-warning)`,
  };

  return (
    <div 
      style={warningTintStyle}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all shadow-none"
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg shrink-0 mt-0.5 sm:mt-0"
          style={{
            backgroundColor: `color-mix(in oklch, var(--status-warning) 15%, transparent)`,
          }}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-xs font-medium text-foreground tracking-tight">
            Account Verification Required
          </h3>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5 leading-relaxed">
            Verify your identity to unlock full ProveNode protection and minting privileges.
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={onStartKyc}
        className="text-xs h-8 px-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer"
        title={isKycOpen ? "KYC Form is open below" : "Click to open Identity Verification Form"}
      >
        <span>{isKycOpen ? "Form Opened Below" : "Verify Identity"}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}