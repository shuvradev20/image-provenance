import { ShowcaseContainer } from "@/components/sections/showcase/ShowcaseContainer";

// Params ekhon ekta Promise, tai interface ta ektu update kora holo
interface ShowcasePageProps {
  params: Promise<{
    walletAddress: string;
  }>;
}

// Function er aage async add kora holo
export default async function ShowcasePage({ params }: ShowcasePageProps) {
  // params ke await kore tarpor walletAddress ta ber kora hocche
  const { walletAddress } = await params;

  return (
    <div className="h-full pb-8 animate-in fade-in duration-500">
      <ShowcaseContainer walletAddress={walletAddress} />
    </div>
  );
}