"use client";

import { Loader2 } from "lucide-react";

export function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={`top-skel-${i}`}
              className="bg-card dark:bg-zinc-900/60 border border-border rounded-xl px-5 py-7 min-h-30 flex flex-col justify-between"
            >
              <div className="h-3 w-28 bg-muted rounded" />
              <div className="flex items-baseline gap-2 mt-4">
                <div className="h-6 w-12 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={`bottom-skel-${i}`}
              className="bg-card dark:bg-zinc-900/60 border border-border rounded-xl px-5 py-7 min-h-30 flex flex-col justify-between"
            >
              <div className="h-3 w-28 bg-muted rounded" />
              <div className="flex items-baseline gap-2 mt-4">
                <div className="h-6 w-12 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>

        <div className="flex flex-col items-center justify-center gap-2.5">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground font-mono text-xs">
            Loading recent pending requests...
          </p>
        </div>
      </div>
    </div>
  );
}