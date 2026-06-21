import AssetContainer from "@/components/sections/asset/AssetContainer";

type Props = {
    params: Promise<{ hash: string }>;
};

export default async function AssetPage({ params }: Props) {
    
    const { hash } = await params;

    return (
        <main className="min-h-screen bg-background text-foreground pb-20">
            <AssetContainer hash={hash} />
        </main>
    );
}