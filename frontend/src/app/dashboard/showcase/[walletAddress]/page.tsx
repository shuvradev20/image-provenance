import { ShowcaseContainer } from "@/components/sections/showcase/ShowcaseContainer";

interface ShowcasePageProps {
  params: Promise<{
    walletAddress: string;
  }>;
}

export default async function ShowcasePage({ params }: ShowcasePageProps) {
  const { walletAddress } = await params;

  return (
    <div className="w-full h-full animate-in fade-in duration-300">
        <ShowcaseContainer walletAddress={walletAddress} />
    </div>
  );
}