import AssetContainer from "@/components/sections/asset/AssetContainer";

type Props = {
    params: Promise<{ hash: string }>;
};

export default async function AssetPage({ params }: Props) {
    
    const { hash } = await params;

    return (
        <main className=" bg-background text-foreground">
            <AssetContainer hash={hash} />
        </main>
    );
}