'use client'

import { motion } from 'framer-motion'
import { UploadCloud, ShieldCheck, Database, HardDriveDownload } from 'lucide-react'
import { cn } from "@/lib/utils"

const steps = [
  {
    step: "01",
    title: "Secure Upload",
    desc: "End-to-end encryption from the very first byte. Your creative work remains absolutely yours, isolated from unauthorized access.",
    icon: UploadCloud,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    className: "md:col-span-7", 
  },
  {
    step: "02",
    title: "Invisible Guard",
    desc: "A cryptographic secret ID binds to your image pixels.",
    icon: ShieldCheck,
    color: "text-cyan-500 dark:text-cyan-400",
    bgColor: "bg-cyan-500/10",
    className: "md:col-span-5",
  },
  {
    step: "03",
    title: "Blockchain Anchor",
    desc: "Immutable fingerprint minted directly on Ethereum.",
    icon: Database,
    color: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    className: "md:col-span-5",
  },
  {
    step: "04",
    title: "Decentralized Vault",
    desc: "Distributed across global nodes. Zero single points of failure, ensuring your proof of ownership outlives any server.",
    icon: HardDriveDownload,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    className: "md:col-span-7",
  }
]

export function HowItWorks() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center py-12 md:py-16 bg-transparent">
      <div className="relative max-w-6xl mx-auto w-full px-6 md:px-9">
        <div className="mb-14 md:mb-16 text-center flex flex-col items-center">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white"
          >
            How ProveNode Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-neutral-600 dark:text-gray-400 max-w-xl text-sm md:text-base mx-auto font-medium"
          >
            From a simple upload to a cryptographically secured digital asset.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6"> 
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] p-8 transition-all duration-500",
                "bg-white/80 dark:bg-[#080808]/10 backdrop-blur-xl border border-black/10 dark:border-white/10",
                "hover:border-black/20 dark:hover:border-white/20",
                "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]",
                "flex flex-col justify-between min-h-50 md:min-h-60",
                item.className
              )}
            >
              <span className="absolute top-4 right-6 text-4xl md:text-5xl font-black text-black/10 dark:text-white/5 origin-center group-hover:scale-110 transition-transform duration-500">
                {item.step}
              </span>

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className={cn(
                    "mb-6 inline-flex p-3 rounded-2xl border border-black/5 dark:border-white/5 transition-transform duration-500 group-hover:scale-110",
                    item.bgColor
                  )}>
                    <item.icon className={cn("w-6 h-6", item.color)} />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                </div>
                
                <p className="text-neutral-600 dark:text-gray-400 text-sm md:text-base leading-relaxed max-w-[90%]">
                  {item.desc}
                </p>
              </div>

              <div className="absolute inset-0 bg-linear-to-br from-neutral-100/50 dark:from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}