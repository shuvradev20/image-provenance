"use client";

import { Plus } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export function AddAdminButton() {
  const { setCreateModalOpen } = useAdminStore();

  return (
    <button
      onClick={() => setCreateModalOpen(true)}
      title="Add New Admin"
      className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-mono font-medium rounded-md border border-border bg-foreground text-background hover:bg-foreground/90 transition cursor-pointer"
    >
      <Plus className="w-3.5 h-3.5" />
      <span>Add New Admin</span>
    </button>
  );
}