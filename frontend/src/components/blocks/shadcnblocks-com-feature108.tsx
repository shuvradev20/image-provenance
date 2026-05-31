'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Layout, Pointer, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FeatureSection() {
  const tabs = [
    {
      value: "tab-1",
      icon: <Zap className="w-4 h-4" />,
      label: "Assetization",
      content: {
        badge: "The Digital Deed",
        title: "Create Your Digital Asset.",
        description: "Uploading an image transforms it into a secure digital asset using invisible watermarking and blockchain hashing. It’s your personal digital deed.",
        buttonText: "Secure Your Image",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070"
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
        image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=2070" // Working link
      }
    },
    {
      value: "tab-3",
      icon: <Layout className="h-auto w-4" />,
      label: "Ownership",
      content: {
        badge: "Seamless Transfer",
        title: "Manage & Transfer Rights.",
        description: "Transfer ownership anytime with full on-chain transparency. Web 2.5 approach ensures high security with lightning-fast speed.",
        buttonText: "Manage Ownership",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015"
      }
    }
  ];

  return (
    <section className="py-24 bg-[#030303]">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-16">
          Advanced Control for Your Digital Assets.
        </h2>

        <Tabs defaultValue="tab-1" className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-4 mb-12">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400 transition-all border border-transparent data-[state=active]:border-white/10"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="max-w-6xl mx-auto bg-white rounded-[32px] p-8 md:p-16 text-slate-900 shadow-2xl">
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="grid md:grid-cols-2 gap-12 items-center outline-none">
                <div className="space-y-6">
                  <Badge variant="outline" className="border-cyan-200 text-cyan-600 bg-cyan-50">
                    {tab.content.badge}
                  </Badge>
                  <h3 className="text-3xl md:text-5xl font-bold">{tab.content.title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">{tab.content.description}</p>
                  {/* <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8 h-12" size="lg">
                    {tab.content.buttonText}
                  </Button> */}
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                  <img src={tab.content.image} alt="Feature" className="w-full h-full object-cover aspect-video" />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}