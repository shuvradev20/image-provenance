'use client'

import React from 'react'
import { Shield } from 'lucide-react'
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export function HeroContent() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 mt-14 text-center z-10 relative">
      
      {/* 1. Announcement Tag: Powered by Ethereum Blockchain */}
   {/* 1. Refined Announcement Tag: Powered by Ethereum */}
      <div className="mb-14 flex justify-center group">
        <div className="relative rounded-full p-px transition-all duration-300 ">
          {/* Border Gradient effect */}
          <div className="absolute inset-0 rounded-full bg-linear-to-r from-white-500/50 via-magenta-500/20 to-purple-200/20" />
          
          <div className="relative rounded-full px-3 py-2 text-[10px] sm:text-xs text-gray-300 bg-[#1e1c1c] flex items-center gap-1 tracking-wider font-semibold backdrop-blur-xl">
            {/* Ethereum Icon with a subtle pulse animation */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0  blur-sm opacity-50 animate-pulse rounded-full" />
              <svg 
                className="w-3.5 h-4 text-gray-400 relative z-10" 
                viewBox="0 0 320 512" 
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
              </svg>
            </div>
            
            <span className="bg-clip-text text-transparent bg-linear-to-r from-gray-100 to-gray-300">
              Powered by Ethereum Blockchain
            </span>
          </div>
        </div>
      </div>
      
      {/* 2. Main Headline: Exactly text from 1st image, white color */}
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
        Secure the Authenticity of <br />
        <span className="bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Your Visual Story
        </span>
      </h1>
      
      {/* 3. Description Text */}
      <p className="max-w-2xl text-base font-medium text-gray-400 sm:text-xl/8 mb-10">
        Every masterpiece deserves an undeniable beginning. Protect your vision with hidden layer of trust
      </p>
      
      {/* 4. Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
        {/* Primary Button - Ektu refined glow effect */}
        <HoverBorderGradient
          containerClassName="rounded-full shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300"
          className="bg-black/80 text-white flex items-center gap-2 px-6 py-3 text-sm sm:text-base font-semibold"
          duration={1}
          clockwise={true}
        >
          <Shield className="w-5 h-5 text-purple-400" />
          <span>Secure Your Work</span>
        </HoverBorderGradient>
                
        {/* Secondary Button */}
        <button className="rounded-full bg-transparent border border-white/5 hover:border-white/20 px-6 py-3 text-sm sm:text-base font-semibold text-white transition-all duration-300">
          Verify an Asset
        </button>
      </div>
      
    </div>
  )
}