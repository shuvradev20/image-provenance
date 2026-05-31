import React from 'react'

interface HeroBackgroundProps {
  children?: React.ReactNode;
  gradientColors?: {
    from: string;
    to: string;
  };
  className?: string;
}

const defaultColors = {
  from: "oklch(0.646 0.222 41.116)",
  to: "oklch(0.488 0.243 264.376)"
}

export function HeroBackground({ 
  children, 
  gradientColors = defaultColors,
  className = '' 
}: HeroBackgroundProps) {
  return (
    <div className={`min-h-screen w-full relative ${className}`}>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            background: `linear-gradient(to top right, ${gradientColors.from}, ${gradientColors.to})`
          }}
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
        />
      </div>
      
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] pointer-events-none"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            background: `linear-gradient(to top right, ${gradientColors.from}, ${gradientColors.to})`
          }}
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}