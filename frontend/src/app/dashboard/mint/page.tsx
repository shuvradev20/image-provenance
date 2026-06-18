import MintContainer from "@/components/sections/mint/MintContainer";

export const metadata = {
    title: "Mint Asset | ProveNode",
    description: "Register your digital assets on the blockchain.",
};

export default function MintPage() {
    return (
        <div className="p-4 md:p-8 w-full">
            <MintContainer />
        </div>
    );
}