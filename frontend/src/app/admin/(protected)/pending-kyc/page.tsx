import { PendingKycTable } from "@/components/sections/admin/PendingKycTable";

export default function PendingKycPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Pending KYC Requests</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Review user documents and approve them to register on the ProveNode blockchain.
                </p>
            </div>
            <PendingKycTable />
        </div>
    );
}