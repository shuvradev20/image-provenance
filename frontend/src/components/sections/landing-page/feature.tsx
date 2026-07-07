'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Layout, Pointer, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function Feature() {
  const tabs = [
    {
      value: "tab-1",
      icon: <Zap className="w-4 h-4" />,
      label: "Assetization",
      content: {
        badge: "The Digital Deed",
        title: "Create Your Digital Asset.",
        description: "Uploading an image transforms it into a secure digital asset using invisible watermarking and blockchain hashing. It's your personal digital deed.",
        buttonText: "Secure Your Image",
        image: "/images/featureImage1.jpg"
      }
    },
    {
      value: "tab-2",
      icon: <Pointer className="w-4 h-4" />,
      label: "Traceability",
      content: {
        badge: "The Invisible DNA",
        title: "Track Every Edit.",
        description: "Origin tracking remains intact even if images are edited. Our invisible DNA technology links every version back to its original source.",
        buttonText: "View Traceability",
        image: "/images/featureImage2.jpg"
      }
    },
    {
      value: "tab-3",
      icon: <Layout className="w-4 h-4" />,
      label: "Ownership",
      content: {
        badge: "Seamless Transfer",
        title: "Manage & Transfer Rights.",
        description: "Transfer ownership anytime with full on-chain transparency. Web 2.5 approach ensures high security with lightning-fast speed.",
        buttonText: "Manage Ownership",
        image: "/images/featureImage3.jpg"
      }
    }
  ];

  return (
    <div className="w-full">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white text-center mb-16 tracking-tight">
          Advanced Control for Your Digital Assets.
        </h2>

        <Tabs defaultValue="tab-1" className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300
                  text-slate-600 dark:text-gray-400 border border-transparent hover:bg-slate-200/50 dark:hover:bg-white/5
                  data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700 data-[state=active]:border-cyan-200
                  dark:data-[state=active]:bg-cyan-500/10 dark:data-[state=active]:text-cyan-400 dark:data-[state=active]:border-cyan-500/30"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative max-w-6xl mx-auto rounded-[32px] p-6 md:p-12 lg:p-16 transition-all duration-500 group">
            <div className="absolute inset-0 rounded-[32px] bg-white/10 dark:bg-white/3 backdrop-blur-3xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] z-0 transition-colors duration-300" />

            <div className="relative z-1">
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="grid md:grid-cols-2 gap-8 md:gap-16 items-center outline-none animate-in fade-in zoom-in-95 duration-500">

                  <div className="space-y-6 order-2 md:order-1">
                    <Badge 
                      variant="outline" 
                      className="border-cyan-200 bg-cyan-50/50 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400 backdrop-blur-md"
                    >
                      {tab.content.badge}
                    </Badge>
                    <h3 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                      {tab.content.title}
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                      {tab.content.description}
                    </p>
                  </div>

                  <div className="order-1 md:order-2 relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-transparent">
                    <Image 
                      src={tab.content.image} 
                      alt={tab.content.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={tab.value === "tab-1"} 
                    />
                    <div className="absolute inset-0 bg-black/0 dark:bg-black/10 pointer-events-none" />
                  </div>
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}