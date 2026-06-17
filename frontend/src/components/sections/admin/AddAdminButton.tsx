"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export function AddAdminButton() {
    const { setCreateModalOpen } = useAdminStore();

    return (
        <Button 
            onClick={() => setCreateModalOpen(true)}
            className="h-10 px-5 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-colors"
        >
            <Plus className="w-4 h-4 mr-2" />
            Add New Admin
        </Button>
    );
}