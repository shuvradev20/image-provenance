'use client'

import { useState } from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { AuthModal } from "../ui/auth-modal";

export function Hero() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 mt-6 text-center z-10 relative">
      <div className="pb-10 md:pb-16 flex justify-center group">
        <div className="relative rounded-full p-px transition-all duration-300 ">
          <div className="absolute inset-0 rounded-full bg-linear-to-r from-gray-300 via-fuchsia-500/20 to-purple-200/20 dark:from-white/10 dark:via-fuchsia-500/20 dark:to-purple-200/20" />

          <div className="relative rounded-full px-3 py-2 text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-[#1e1c1c]/90 border border-gray-300 dark:border-transparent flex items-center gap-1.5 tracking-wider font-semibold backdrop-blur-xl transition-colors">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 blur-sm opacity-50 animate-pulse rounded-full bg-gray-400/30 dark:bg-gray-400/30" />
              <svg 
                className="w-3.5 h-4 text-gray-500 dark:text-gray-400 relative z-10" 
                viewBox="0 0 320 512" 
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
              </svg>
            </div>
            
            <span className="bg-clip-text text-transparent bg-linear-to-r from-gray-700 to-gray-500 dark:from-gray-100 dark:to-gray-300">
              Powered by Ethereum Blockchain
            </span>
          </div>
        </div>
      </div>
      
      <h1 className="text-[28px] sm:text-5xl md:text-6xl font-extrabold tracking-tight text-black dark:text-white transition-colors leading-tight">
        <span className="block whitespace-nowrap">Stop Shadow Ownership.</span>
        <span className="block bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-1 md:mt-2">
          Permanently.
        </span>
      </h1>
      <p className="max-w-2xl text-gray-500 dark:text-gray-400 text-base sm:text-xl/8 mb-10 pt-4 transition-colors">
        Your creation is a digital asset, not just a file. Protect its value with the ultimate source of truth that never leaves your image.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 w-full sm:w-auto px-4 sm:px-0">
    
        <div onClick={() => setIsAuthModalOpen(true)} className="cursor-pointer w-full sm:w-auto">
          <HoverBorderGradient
            containerClassName="rounded-full shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 w-full"
            className="bg-black/80 dark:bg-black/80 text-white dark:text-white flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-semibold w-full text-center backdrop-blur-md transition-colors"
            duration={1}
            clockwise={true}
          >
            <span>Certify Your Asset</span>
          </HoverBorderGradient>
        </div>
                
        <button className="w-full sm:w-auto rounded-full bg-transparent border border-gray-300 dark:border-white/10 hover:border-gray-800 dark:hover:border-white/30 px-6 py-3 text-sm sm:text-base font-semibold text-gray-700 dark:text-white transition-all duration-300">
          Verify Ownership
        </button>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  )
}