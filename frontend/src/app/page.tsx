import { HeroBackground } from "@/components/ui/hero-background.";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { HowItWorksBackground } from "@/components/ui/how-it-works-background";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Problems } from "@/components/sections/problems";
import FAQ from "@/components/sections/faqs";
import { Footer7 } from "@/components/ui/footer";
import { FeatureBackground } from "@/components/ui/feature-background";
import { Feature } from "@/components/sections/feature";

export default function Home() {
  return (
    <main className="w-full">
      <HeroBackground>
        <Navbar />
        <Hero />
      </HeroBackground>
      <Problems/>
      <HowItWorksBackground>
        <HowItWorks/>
      </HowItWorksBackground>
      <FeatureBackground>
        <Feature/>
      </FeatureBackground>
      <FAQ/>
      <Footer7/>
    </main>
  );
}