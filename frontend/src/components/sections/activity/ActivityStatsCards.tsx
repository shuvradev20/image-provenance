"use client";

import React from "react";
import { ActivityStatsSkeleton } from "./ActivitySkeleton";

export interface ActivityTrendItem {
  date: string;
  transactions: number;
}

export interface ActivityStatsData {
  totalTransactions?: number;
  tx24hCount?: number;
  totalVerifiedAssets?: number;
  totalRegisteredUsers?: number;
  avgGasEth?: string;
  activityTrend?: ActivityTrendItem[];
}

interface ActivityStatsCardsProps {
  stats: ActivityStatsData | null;
  isLoading: boolean;
}

interface PointItem {
  x: number;
  y: number;
  date: string;
  count: number;
}

export const ActivityStatsCards: React.FC<ActivityStatsCardsProps> = ({
  stats,
  isLoading,
}) => {
  if (isLoading) {
    return <ActivityStatsSkeleton />;
  }

  const activityTrend: ActivityTrendItem[] = stats?.activityTrend || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-card border border-border rounded-xl p-5 transition">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-muted-foreground text-xs uppercase">
            Transactions
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            {stats?.totalTransactions?.toLocaleString() || 0}
          </span>
          <span className="text-xs px-1.5 text-foreground">
            +{stats?.tx24hCount || 0} in 24h
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 transition">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-muted-foreground text-xs uppercase">
            Average Transaction Fee (24h)
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            {stats?.avgGasEth || "0.00021 ETH"}
          </span>
          <span className="text-xs text-muted-foreground">Arbitrum L2</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 transition">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-muted-foreground text-xs uppercase">
            Platform Totals
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            {stats?.totalVerifiedAssets || 0}
          </span>
          <span className="text-xs text-muted-foreground">Assets</span>
          <span className="h-4 border-r border-border my-auto"></span>
          <span className="text-sm font-semibold text-foreground">
            {stats?.totalRegisteredUsers || 0}
          </span>
          <span className="text-xs text-muted-foreground">Users</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 transition">
        <div className="flex items-center mb-2">
          <span className="text-muted-foreground text-xs uppercase">
            Last 14-Day Activity
          </span>
        </div>

        <div className="w-full h-8 relative flex items-center">
          {(() => {
            const TOTAL_SLOTS = 14; 
            const svgWidth = 200;
            const svgHeight = 32;

            const rawCounts = activityTrend.map((t) => t.transactions || 0);

            const actualMax = rawCounts.length > 0 ? Math.max(...rawCounts) : 0;
            const actualMin = rawCounts.length > 0 ? Math.min(...rawCounts) : 0;
            const maxY = actualMax > 0 ? Math.ceil(actualMax + Math.max(1, actualMax * 0.2)) : 3;
            const minY = Math.max(0, Math.floor(actualMin - Math.max(1, actualMin * 0.2)));

            const xStep = svgWidth / (TOTAL_SLOTS - 1);
            const range = maxY - minY || 1;

            const originY = svgHeight - ((0 - minY) / range) * (svgHeight - 8) - 4;

            const points: PointItem[] = activityTrend.map((item, i) => {
              const x = (i + 1) * xStep; 
              const y = svgHeight - ((item.transactions - minY) / range) * (svgHeight - 8) - 4;

              return { x, y, date: item.date, count: item.transactions };
            });

            const pathD = `M 0,${Math.min(Math.max(originY, 4), svgHeight - 4)} ` + points.map((p) => `L ${p.x},${p.y}`).join(" ");

            return (
              <>
                <div className="flex flex-col justify-between h-full text-[9px] text-muted-foreground font-mono pr-1.5 select-none border-r border-border/40">
                  <span>{maxY}</span>
                  <span>{minY}</span>
                </div>

                <div className="w-full h-full pl-1">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="0"
                      y1={svgHeight - 2}
                      x2={svgWidth}
                      y2={svgHeight - 2}
                      stroke="currentColor"
                      strokeDasharray="2 2"
                      className="text-border/60"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground/50"
                    />
                  </svg>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};