"use client";

import { useEffect, useState } from "react";
import { Users, Clock, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import adminApi from "@/lib/adminAxiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function DashboardStats() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminApi.get('/admin/dashboard-stats');
                setStats(response.data.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
                toast.error("Failed to load dashboard statistics");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="mb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <Card key={`top-${i}`} className="shadow-sm border-border">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
                                <div className="h-3 w-32 bg-muted animate-pulse rounded mt-2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={`bottom-${i}`} className="shadow-sm border-border">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
                                <div className="h-3 w-32 bg-muted animate-pulse rounded mt-2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-border hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total registered accounts</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border hover:border-indigo-500/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Admins</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.admins.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">System administrators</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm border-border hover:border-emerald-500/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Verified Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users.verified || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Approved for smart contracts</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border hover:border-amber-500/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-500">Pending KYCs</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{stats?.users.pending || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Action required</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border hover:border-rose-500/50 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Unverified Users</CardTitle>
                        <UserX className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users.unverified || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Incomplete KYC / Rejected</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}