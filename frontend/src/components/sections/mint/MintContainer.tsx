"use client";

import MintAssetForm from "./MintAssetForm";
import MintActionArea from "./MintActionArea";
import ActionPreCheckGuard from "@/components/guards/ActionPreCheckGuard";

export default function MintContainer() {
    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in pb-18 md:pb-8">
            <ActionPreCheckGuard>
                <div className="bg-card dark:bg-zinc-900/60 rounded-xl p-6 lg:p-8 space-y-6">
                    <MintAssetForm />
                    <MintActionArea />
                </div>
            </ActionPreCheckGuard>
        </div>
    );
}