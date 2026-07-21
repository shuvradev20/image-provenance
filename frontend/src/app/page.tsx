import { HeroBackground } from "@/components/ui/hero-background.";
import { Navbar } from "@/components/layout/user/navbar";
import { Hero } from "@/components/sections/landing-page/hero";
import { HowItWorksBackground } from "@/components/ui/how-it-works-background";
import { HowItWorks } from "@/components/sections/landing-page/how-it-works";
import { Problems } from "@/components/sections/landing-page/problems";
import FAQ from "@/components/sections/landing-page/faqs";
import { Footer7 } from "@/components/ui/footer";
import { FeatureBackground } from "@/components/ui/feature-background";
import { Feature } from "@/components/sections/landing-page/feature";

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