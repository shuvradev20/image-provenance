"use client";

import Link from "next/link";
import { DashboardStats } from "./DashboardStats";
import { RecentKycTable } from "./RecentKycTable";

export function OverviewContainer() {
  return (
    <div className="space-y-8">
      <DashboardStats />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground tracking-tight">
            Recent KYC Requests
          </h2>
          <Link
            href="/admin/pending-kyc"
            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            View all pending
          </Link>
        </div>

        <RecentKycTable />
      </div>
    </div>
  );
}