"use client";

import MintAssetForm from "./MintAssetForm";
import MintActionArea from "./MintActionArea";
import ActionPreCheckGuard from "@/components/guards/ActionPreCheckGuard";

export default function MintContainer() {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-4 md:pb-8">
            <ActionPreCheckGuard>
                <div className=" bg-muted/50 rounded-2xl mb-16 sm:mb-0 p-4 lg:p-8">
                    <MintAssetForm />
                    <MintActionArea />
                </div>
            </ActionPreCheckGuard>
        </div>
    );
}