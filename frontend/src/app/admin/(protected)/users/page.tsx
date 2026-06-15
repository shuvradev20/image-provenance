import { VerifiedUsersTable } from "@/components/sections/admin/VerifiedUsersTable";

export default function VerifiedUsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Verified Users</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    View users who have successfully passed KYC and are securely registered on the ProveNode blockchain.
                </p>
            </div>
            <VerifiedUsersTable />
        </div>
    );
}