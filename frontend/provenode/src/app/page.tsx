import { HeroBackground } from "@/components/ui/hero-background.";
import { Navbar } from "@/components/ui/navbar";
import { HeroContent } from "@/components/ui/hero-content";
import { FeatureBackground } from "@/components/ui/feature-background";
import { FeatureCards } from "@/components/sections/feature-cards";

export default function Home() {
  return (
    <main className="w-full">
       <HeroBackground>
      <Navbar />
      <HeroContent />

    </HeroBackground>

   <FeatureBackground>
      <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
             Core Security Features
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
             How ProveNode ensures your visual assets stay yours, forever.
          </p>
        </div>

        {/* Feature Cards ekhane boshbe */}
        <FeatureCards />
      </FeatureBackground>
    </main>
  );
}