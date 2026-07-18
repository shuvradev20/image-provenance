"use client";

import MintPreChecks from "./MintPreChecks";
import MintAssetForm from "./MintAssetForm";
import MintActionArea from "./MintActionArea";

export default function MintContainer() {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-4 md:pb-8">
            <MintPreChecks>
                <div className=" border border-border rounded-2xl p-4 lg:p-8">
                    <MintAssetForm />
                    <MintActionArea />
                </div>
            </MintPreChecks>
        </div>
    );
}