"use client";

import MintPreChecks from "./MintPreChecks";
import MintAssetForm from "./MintAssetForm";
import MintActionArea from "./MintActionArea";
import { Sparkles } from "lucide-react";

export default function MintContainer() {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    Mint New Asset <Sparkles className="w-6 h-6 text-primary" />
                </h1>
                <p className="text-muted-foreground">
                    Register your digital asset on the ProveNode blockchain and establish an immutable certificate of authenticity.
                </p>
            </div>

            {/* Main Content Area */}
            <MintPreChecks>
                <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm">
                    {/* Section 1 to 5: Form Inputs & Image Dropzone */}
                    <MintAssetForm />
                    
                    {/* Section 6 & 7: Button and Tracker */}
                    <MintActionArea />
                </div>
            </MintPreChecks>
        </div>
    );
}