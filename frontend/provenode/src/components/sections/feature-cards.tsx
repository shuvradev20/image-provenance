'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Fingerprint, Globe, Shield, Zap } from 'lucide-react'

const features = [
  {
    title: "Immutable Ownership Record",
    description: "Cryptographically seal your visual assets on the Ethereum blockchain. No one can alter the record once it's set.",
    icon: <Fingerprint className="w-8 h-8 text-cyan-400" />,
    gradient: "from-cyan-500/20 to-transparent"
  },
  {
    title: "Transparent Verification",
    description: "Anyone can verify asset authenticity and provenance 24/7. Total transparency for your visual story.",
    icon: <Globe className="w-8 h-8 text-purple-400" />,
    gradient: "from-purple-500/20 to-transparent"
  },
  {
    title: "Multi-Layered Security",
    description: "Advanced encryption and invisible watermarking protect metadata and asset integrity from theft.",
    icon: <Shield className="w-8 h-8 text-blue-400" />,
    gradient: "from-blue-500/20 to-transparent"
  },
  {
    title: "Instant Provenance Tracking",
    description: "Track the lineage of any asset instantly. Prove origin and history with a single cryptographic hash.",
    icon: <Zap className="w-8 h-8 text-emerald-400" />,
    gradient: "from-emerald-500/20 to-transparent"
  }
]

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto mt-12">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
        >
          {/* Subtle Background Glow on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />

          <div className="relative z-10">
            {/* Icon Box */}
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-white/[0.05] border border-white/[0.1] group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">
              {feature.title}
            </h3>
            
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              {feature.description}
            </p>
          </div>

          {/* Decorative Corner Glow */}
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  )
}