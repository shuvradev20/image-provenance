import { DashboardStats } from "@/components/sections/admin/DashboardStats";
import { RecentKycTable } from "@/components/sections/admin/RecentKycTable";
import Link from "next/link";

export default function AdminDashboardPage() {
    return (
        <div className="container mx-auto max-w-7xl">
            <DashboardStats />

            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold tracking-tight">Recent KYC Requests</h2>
                    <Link 
                        href="/admin/pending-kyc" 
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        View all pending
                    </Link>
                </div>
                <RecentKycTable />
            </div>
        </div>
    );
}