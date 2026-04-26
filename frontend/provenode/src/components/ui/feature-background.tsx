'use client'

import React from 'react'

interface HeroBackgroundProps {
  children?: React.ReactNode;
  gradientColors?: {
    primary: string;
    secondary: string;
  };
  className?: string;
}

const defaultColors = {
  primary: "oklch(0.5 0.2 260)",   // Deep Blue/Purple
  secondary: "oklch(0.5 0.20 200)" // Teal/Cyan tint
}

export function FeatureBackground({ 
  children, 
  gradientColors = defaultColors,
  className = '' 
}: HeroBackgroundProps) {
  return (
    <div className={`min-h-screen w-full bg-[#030303] overflow-hidden relative ${className}`}>
      
      {/* 1. Subtle Grid Pattern - Blockchain vibe er jonno */}
      <div className="absolute inset-0 z-0 opacity-[0.15]" 
           style={{ backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.6px)`, backgroundSize: '30px 30px' }}>
      </div>

      {/* 2. Aurora/Glow Blobs - Soft r organic look */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Blob */}
        <div 
          className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ background: gradientColors.primary }}
        />
        
        {/* Bottom Left Blob */}
        <div 
          className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{ background: gradientColors.secondary }}
        />

        {/* Center Glow - Text k highlight korar jonno */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[180px]"
        />
      </div>

      {/* 3. Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>

      {/* Optional: Noise Texture for that extra premium feel */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none contrast-150 brightness-100"
           style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}>
      </div>
    </div>
  )
}