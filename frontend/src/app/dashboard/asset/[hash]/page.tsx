import AssetContainer from "@/components/sections/asset/AssetContainer";

type Props = {
    params: Promise<{ hash: string }>;
};

export default async function AssetPage({ params }: Props) {
    
    const { hash } = await params;

    return (
        <div className="w-full h-full animate-in fade-in duration-300">
            <AssetContainer hash={hash} />
        </div>
    );
}