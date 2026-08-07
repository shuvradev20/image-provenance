"use client";

import { useEffect, useState } from "react";
import { Users, Clock, ShieldCheck, UserCheck, UserX, LucideIcon } from "lucide-react";
import { toast } from "sonner";
import adminApi from "@/lib/adminAxiosInstance";

interface StatsData {
  users: {
    total: number;
    verified: number;
    pending: number;
    unverified: number;
  };
  admins: {
    total: number;
  };
}

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  value: number;
  description: string;
  tooltip: string;
  iconColor?: string;
  valueColor?: string;
}

function StatCard({
  title,
  icon: Icon,
  value,
  description,
  tooltip,
  iconColor = "text-muted-foreground",
  valueColor = "text-foreground",
}: StatCardProps) {
  return (
    <div
      className="bg-card dark:bg-zinc-900/60 border border-border rounded-xl px-5 py-7 min-h-30 flex flex-col justify-start hover:bg-zinc-200/80 dark:hover:bg-zinc-800/60 transition cursor-default"
      title={tooltip}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-mono tracking-wider uppercase">
          {title}
        </span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex items-center gap-2.5 mt-3">
        <span className={`text-base font-mono font-medium ${valueColor}`}>
          {value.toLocaleString()}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {description}
        </span>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.get("/admin/dashboard-stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
        toast.error("Failed to load dashboard statistics");
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Users"
          icon={Users}
          value={stats?.users.total ?? 0}
          description="Total registered accounts"
          tooltip="Total registered user accounts in the platform"
        />

        <StatCard
          title="Total Admins"
          icon={ShieldCheck}
          value={stats?.admins.total ?? 0}
          description="System administrators"
          tooltip="Active system administrators"
          iconColor="text-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Verified Users"
          icon={UserCheck}
          value={stats?.users.verified ?? 0}
          description="Approved for smart contracts"
          tooltip="Users fully verified for smart contract interaction"
          iconColor="text-emerald-500 dark:text-emerald-400"
          valueColor="text-emerald-500 dark:text-emerald-400"
        />

        <StatCard
          title="Pending KYCs"
          icon={Clock}
          value={stats?.users.pending ?? 0}
          description="Action required"
          tooltip="KYC applications pending admin review"
          iconColor="text-amber-500 dark:text-amber-400"
          valueColor="text-amber-500 dark:text-amber-400"
        />

        <StatCard
          title="Unverified Users"
          icon={UserX}
          value={stats?.users.unverified ?? 0}
          description="Incomplete / Rejected"
          tooltip="Users with unsubmitted or rejected KYC applications"
          iconColor="text-rose-500 dark:text-rose-400"
          valueColor="text-rose-500 dark:text-rose-400"
        />
      </div>
    </div>
  );
}