"use client";

import React, { useEffect, useState } from "react";
import { ActivityStatsCards } from "./ActivityStatsCards";
import { ActivityTable } from "./ActivityTable";
import { getActivityLogsApi, getActivityStatsApi } from "@/lib/api/activity";
import { useAuthStore } from "@/store/useAuthStore";

export const ActivityContainer: React.FC = () => {
  const { user } = useAuthStore();

  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  const [currentTab, setCurrentTab] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsStatsLoading(true);
        const res = await getActivityStatsApi();
        if (res?.data) {
          setStats(res.data);
        } else if (res) {
          setStats(res);
        }
      } catch (err) {
        console.error("Failed to load activity stats:", err);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLogsLoading(true);
        const res = await getActivityLogsApi(
          currentPage,
          10,
          currentTab,
          user?.walletAddress
        );

        if (res?.data) {
          setLogs(res.data.logs || []);
          setPagination(res.data.pagination || null);
        } else if (res) {
          setLogs(res.logs || []);
          setPagination(res.pagination || null);
        }
      } catch (err) {
        console.error("Failed to fetch activity logs:", err);
      } finally {
        setIsLogsLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage, currentTab, user?.walletAddress]);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setCurrentPage(1); 
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <ActivityStatsCards stats={stats} isLoading={isStatsLoading} />

      <ActivityTable
        logs={logs}
        pagination={pagination}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onPageChange={setCurrentPage}
        isLoading={isLogsLoading}
      />
    </div>
  );
};