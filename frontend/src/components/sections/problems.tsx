'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const problems = [
  {
    title: "Proof is easily lost.",
    desc: "Traditional file data can be erased in seconds. Without it, your work has no history, no proof, and no value."
  },
  {
    title: "AI makes fakes look real.",
    desc: "Today, anyone can manipulate an image. Without a hidden layer of trust, there's no way to prove it's been tampered with."
  },
  {
    title: "Your credit is stolen.",
    desc: "Once your image is online, you lose control. Someone else claims it, and you're left with no way to trace it back."
  }
]

export function Problems() {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center py-20 overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-75 md:w-125 h-75 md:h-125 bg-red-500/20 dark:bg-red-500/20 blur-[60px] md:blur-[90px] rounded-full pointer-events-none transition-colors duration-500" />

      <div className="relative max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col items-center">
        
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
            Digital Trust is Broken
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 justify-items-center items-start w-full">
          
          <div className="relative w-full flex flex-col items-center">
            
            <div className="relative group w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-none bg-white dark:bg-[#050505] transition-colors">
              
              <Image 
                src="/images/problemImage.jpg"
                alt="Nature Background"
                fill
                sizes="100vw"
                className="object-cover object-center transition-all duration-700 
                opacity-60 blur-xs dark:opacity-60
                group-hover:blur-0 group-hover:opacity-80 dark:group-hover:opacity-80 group-hover:scale-110 z-0" 
              />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
              >
                <div className="px-6 py-3 border border-red-200 dark:border-red-500/50 bg-white/90 dark:bg-red-500/10 backdrop-blur-md rounded-lg shadow-lg shadow-red-500/10 dark:shadow-[0_0_30px_-5px_rgba(239,68,68,0.6)] transition-all">
                  <span className="text-red-600 dark:text-red-500 font-mono font-bold tracking-[0.2em] text-sm md:text-lg whitespace-nowrap">
                    STATUS: UNVERIFIED
                  </span>
                </div>
              </motion.div>
            </div>
            
            <p className="mt-6 text-gray-500 dark:text-gray-400 font-mono text-[10px] md:text-xs uppercase tracking-widest text-center transition-colors">
              Traditional Metadata: No Trace Found
            </p>
          </div>

          <div className="flex flex-col space-y-12 w-full max-w-md">
            {problems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-100px", once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed transition-colors">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}