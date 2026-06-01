import React from 'react';

interface FeatureBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  glowClass?: string;
}

const defaultGlows = {
  glowClass: "bg-purple-200/50 dark:bg-purple-900/40" 
};

export function FeatureBackground({
  children,
  className = '',
  glowClass = defaultGlows.glowClass,
}: FeatureBackgroundProps) {
  return (
    <div className={`relative w-full bg-slate-50 dark:bg-[#05000a] py-24 overflow-hidden transition-colors duration-300 ${className}`}>

      <div 
        aria-hidden="true"
        className={`absolute -bottom-40 -left-20 w-200 h-150 rounded-[100%] blur-[160px] pointer-events-none z-0 ${glowClass}`} 
      />

      <div 
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23334155' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        className="absolute inset-0 z-0 pointer-events-none block dark:hidden" 
      />

      <div 
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f43f5e' fill-opacity='0.08' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        className="absolute inset-0 z-0 pointer-events-none hidden dark:block" 
      />

      <div className="relative w-full">
        {children}
      </div>
    </div>
  );
}